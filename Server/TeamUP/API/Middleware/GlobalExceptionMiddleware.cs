using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace API.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;
        public GlobalExceptionMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;
            _env = env;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (KeyNotFoundException ex)
            {
                await WriteResponse(context, HttpStatusCode.NotFound, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                await WriteResponse(context, HttpStatusCode.Conflict, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                await WriteResponse(context, HttpStatusCode.Unauthorized, ex.Message);
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UNIQUE") == true)
            {
                await WriteResponse(context, HttpStatusCode.Conflict,
                    "Korisnik sa ovim emailom već postoji.");
            }
            catch (Exception ex)
            {
                var message = _env.IsDevelopment()
                    ? ex.Message
                    : "Doslo je do greske na serveru.";
                await WriteResponse(context, HttpStatusCode.InternalServerError, message);
            }
        }
        private static async Task WriteResponse(HttpContext context, HttpStatusCode statusCode, string message)
        {
            try
            {
                if (context.Response.HasStarted)
                    return;
                context.Response.StatusCode = (int)statusCode;
                context.Response.ContentType = "application/json";
                var response = new { error = message };
                var json = JsonSerializer.Serialize(response);
                await context.Response.WriteAsync(json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"WriteResponse failed: {ex.Message}");
            }
        }
    }
}