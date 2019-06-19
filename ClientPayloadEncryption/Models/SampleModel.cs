using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ClientPayloadEncryption.Models
{
    public class SampleModel
    {
        // no need to secure these fields...
        public string FirstName { get; set; }
        public string LastName { get; set; }

        // I want to encrypt the secret string before passing to the controller
        public string EncryptedSecret { get; set; }
        public string EncryptedSymmetricalKey { get; set; }
        public string IV { get; set; }
    }
}
