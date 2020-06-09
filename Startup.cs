using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MileStone_Game.Hubs;
using MileStone_Game.Data;
using Microsoft.EntityFrameworkCore;

namespace MileStone_Game
{
    public class Startup
    {
        //string connectionStringId = "UserContextLocal"; // Connect to local SQL Database
        string connectionStringId = "UserContext"; // Connect to Azure DB
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(o => o.AddPolicy("CorsPolicy", builder =>
            {
                builder
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .WithOrigins("http://localhost:3000");
            }));

            services.AddSignalR().AddAzureSignalR("Endpoint=https://milestonesignalr.service.signalr.net;AccessKey=XA9ITqeqc5djn3uuApEED2DKbxsdogHfgO5TIYtPMcU=;Version=1.0;");
            //services.AddSignalR(); // Use for local instance.

            services.AddControllersWithViews();

            services.AddDbContext<UserContext>(options =>
            options.UseSqlServer(Configuration.GetConnectionString(connectionStringId)));

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseCors("CorsPolicy");


            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
                //endpoints.MapHub<ChatHub>("/chatter"); // Comment out when using Azure
                //endpoints.MapHub<GameHub>("/gameServer"); // Comment out when using Azure
            });

            // For Azure instance
            app.UseAzureSignalR(routes =>
            {
                routes.MapHub<ChatHub>("/chatter");
                routes.MapHub<GameHub>("/gameServer");
            });
            
           

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
