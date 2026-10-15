using API.Middleware;
using ApplicationLayer;
using ApplicationLayer.UseCases.Commands;
using ApplicationLayer.UseCases.Queries;
using DataAccessLayer;
using FluentValidation;
using FluentValidation.AspNetCore;
using Implementation.Auth;
using Implementation.Commands;
using Implementation.Queries;
using Implementation.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>()
    ?? throw new InvalidOperationException("AppSettings section is missing.");

builder.Services.AddSingleton(appSettings);

builder.Services.AddDbContext<TeamUpContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=teamup.db"));


builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => {
            var uri = new Uri(origin);
            return uri.Host == "localhost"
                || uri.Host == "teamupfrontend1708.z36.web.core.windows.net";
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(appSettings.JwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<IApplicationActor>(provider =>
{
    var accessor = provider.GetRequiredService<IHttpContextAccessor>();
    var user = accessor.HttpContext?.User;

    if (user == null || user.Identity?.IsAuthenticated != true)
        return new AnonimousActor();

    var idClaim = user.FindFirst("id")
                  ?? user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

    var emailClaim = user.FindFirst("email")
                     ?? user.FindFirst(System.Security.Claims.ClaimTypes.Email);

    if (idClaim == null || emailClaim == null)
        return new AnonimousActor();

    var context = provider.GetRequiredService<TeamUpContext>();
    var userId = int.Parse(idClaim.Value);
    var dbUser = context.Users.FirstOrDefault(u => u.Id == userId && u.DeletedAt == null);
    if (dbUser == null)
        return new AnonimousActor();

    return new JwtActor
    {
        Id = int.Parse(idClaim.Value),
        Identity = emailClaim.Value,
        AllowedUseCases = user.FindAll("useCase").Select(c => int.Parse(c.Value))
    };
});

builder.Services.AddSingleton<ITokenStorage, JwtTokenProvider>();

// Queries
builder.Services.AddTransient<ILoginUserQuery, LoginUserQuery>();
builder.Services.AddTransient<IGetKorisnikaQuery, GetKorisnikaQuery>();
builder.Services.AddTransient<IGetKorisnikeQuery, GetKorisnikeQuery>();
builder.Services.AddTransient<IGetObjekatQuery, GetObjekatQuery>();
builder.Services.AddTransient<IGetObjekteQuery, GetObjekteQuery>();
builder.Services.AddTransient<IGetSportQuery, GetSportQuery>();
builder.Services.AddTransient<IGetSportoveQuery, GetSportoveQuery>();
builder.Services.AddTransient<IGetTerminQuery, GetTerminQuery>();
builder.Services.AddTransient<IGetTermineQuery, GetTermineQuery>();
builder.Services.AddTransient<IGetRezervacijuQuery, GetRezervacijuQuery>();
builder.Services.AddTransient<IGetRezervacijeQuery, GetRezervacijeQuery>();
builder.Services.AddTransient<IGetOceneQuery, GetOceneQuery>();
builder.Services.AddTransient<IGetOceneIgracaQuery, GetOceneIgracaQuery>();

// Commands
builder.Services.AddTransient<IRegisterUserCommand, RegisterUserCommand>();
builder.Services.AddTransient<ICreateObjekatCommand, CreateObjekatCommand>();
builder.Services.AddTransient<IUpdateObjekatCommand, UpdateObjekatCommand>();
builder.Services.AddTransient<IDeleteObjekatCommand, DeleteObjekatCommand>();
builder.Services.AddTransient<ICreateSportCommand, CreateSportCommand>();
builder.Services.AddTransient<IDeleteSportCommand, DeleteSportCommand>();
builder.Services.AddTransient<ICreateTerminCommand, CreateTerminCommand>();
builder.Services.AddTransient<IUpdateTerminCommand, UpdateTerminCommand>();
builder.Services.AddTransient<IDeleteTerminCommand, DeleteTerminCommand>();
builder.Services.AddTransient<ICreateRezervacijuCommand, CreateRezervacijuCommand>();
builder.Services.AddTransient<IUpdateRezervacijuCommand, UpdateRezervacijuCommand>();
builder.Services.AddTransient<IDeleteRezervacijuCommand, DeleteRezervacijuCommand>();
builder.Services.AddTransient<IJoinTerminCommand, JoinTerminCommand>();
builder.Services.AddTransient<ILeaveTerminCommand, LeaveTerminCommand>();
builder.Services.AddTransient<IUpdateIgracStatusCommand, UpdateIgracStatusCommand>();
builder.Services.AddTransient<IUpdateUserCommand, UpdateUserCommand>();
builder.Services.AddTransient<IDeleteUserCommand, DeleteUserCommand>();
builder.Services.AddTransient<ICreateOcenaCommand, CreateOcenaCommand>();
builder.Services.AddTransient<IUpdateOcenaCommand, UpdateOcenaCommand>();
builder.Services.AddTransient<IDeleteOcenaCommand, DeleteOcenaCommand>();
builder.Services.AddTransient<ICreateOcenaIgracaCommand, CreateOcenaIgracaCommand>();
builder.Services.AddTransient<IUpdateOcenaIgracaCommand, UpdateOcenaIgracaCommand>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TeamUP API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseCors("Frontend");

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<CheckDeletedUserMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();