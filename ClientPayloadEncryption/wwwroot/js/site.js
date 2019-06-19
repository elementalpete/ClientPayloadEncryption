// this is what I have so far.  If it is incorrect, feel free to change any or all of it.

async function EncryptAndSubmit() {
    var plainTextSecret = $('#top-secret').val();

    // import the public key used to wrap the symmetrical key.  The public key is safe to expose to the client.  The private key is known only by the server.
    const jwk = {
        "alg": "RSA-OAEP-256",
        "e": "AQAB",
        "ext": true,
        "key_ops": ["wrapKey"],
        "kty": "RSA",
        "n": "pBkuuS-roUtmYzUe9ssxcfY0GwxHn2UjTQRLhqE-66oECUcR3ktMYbwXpL2A_WJQPapscKHeKYXpGLZNqAw6k_k1RodJFl5PdAPRgyS5nwR6a7Bsccbt3h04DLh2oJVfz2tXMsh9j7H_sAhfLjwOAM33na-skCgOqT0DFOydLPB2MtuNtkiIHcGViYOT9JZzKSGoU2GcVf2XCTBW-zqaxeXMlUdUuLstmk7Pfi5Myyz8HQdcPEC3x1eah4MjGS0mSRxiwRKaYqnV-Gv3W4phxFiiJlO9k26gzyT0kb25aZERmuRmmk_L6AGXWXOiutkuqbhebMyR5JmG3VThN2FhHQ"
    }
    const algo = {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' }
    };
    var publicKey = await window.crypto.subtle.importKey('jwk', jwk, algo, false, ['wrapKey']);

    // generate the symmetric key
    const symKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cypher = ab2str(await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, symKey, str2ab(plainTextSecret)));

    // wrap the symmetric key so that it can only be decrypted by the server
    const wrappedKey = ab2str(await window.crypto.subtle.wrapKey('raw', symKey, publicKey, { name: 'RSA-OAEP' }));

    // set the hidden fields
    $('#EncryptedSecret').val(cypher);
    $('#EncryptedSymmetricalKey').val(wrappedKey);
    $('#IV').val(iv);

    // the program I need to use this in uses an AJAX POST here - you can change this as long as AJAX is used.
    $.post(
        '/Home/Index',
        $('form').serialize(),
        function (data, status, jqXHR) {
            alert('Success!');
        }).fail(function () {
            alert('Exception');
        });
}

// helper to convert array buffer to string - feel free to use a different method.
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// helper to convert string to array buffer - feel free to use a different method.
function str2ab(str) {
    let buf = new ArrayBuffer(str.length * 2);
    let bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


// -----------------------------

// the following code is not used in this app, but was used to generate the public and private key provided.
// make changes as needed if the provided keys do not work.
async function GenerateJwk() {
    var key = await window.crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {
            name: "SHA-256"
        }
    },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["wrapKey", "unwrapKey"]
    );

    window.crypto.subtle.exportKey("jwk", key.publicKey).then(
        function (keydata) {
            publicKeyhold = keydata;
            publicKeyJson = JSON.stringify(publicKeyhold);
            console.log('public key:');
            console.log(publicKeyJson);
        }
    );

    window.crypto.subtle.exportKey("jwk", key.privateKey).then(
        function (keydata) {
            privateKeyhold = keydata;
            privateKeyJson = JSON.stringify(privateKeyhold);
            console.log('private key:');
            console.log(privateKeyJson);
        }
    );
}

