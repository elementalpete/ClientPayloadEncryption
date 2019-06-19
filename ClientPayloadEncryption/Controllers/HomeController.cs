using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ClientPayloadEncryption.Models;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Hosting;

namespace ClientPayloadEncryption.Controllers
{
    public class HomeController : Controller
    {
        private readonly IHostingEnvironment _environment;

        public HomeController(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var model = new SampleModel
            {
                FirstName = "Hello",
                LastName = "World"
            };

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Index(SampleModel model)
        {
            // verify that regular properties come through as expected...
            if (model.FirstName != "Hello" || model.LastName != "World")
            {
                throw new Exception("Regular properties failed to post as expected.");
            }

            // verify that other variables are populated by javascript as expected
            if (string.IsNullOrEmpty(model.EncryptedSecret) || string.IsNullOrEmpty(model.EncryptedSymmetricalKey) || string.IsNullOrEmpty(model.IV))
            {
                throw new Exception("Calculated properties were not provided by javascript");
            }

            // TODO: get a reference to the private key - this part should be changed...
            var path = System.IO.Path.Combine(_environment.ContentRootPath, "js-private-key.txt");
            var privateKeyJson = await System.IO.File.ReadAllTextAsync(path);

            // TODO: decrypt string
            string secret = DecryptString(model).Trim();


            // verify that the string decrypted as expected
            if (secret != "This is a secret.")
            {
                throw new Exception("String did not decrypt as expected.");
            }

            return Ok();
        }


        // Decryption Code Goes Here
        private string DecryptString(SampleModel model)
        {
            throw new NotImplementedException();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
