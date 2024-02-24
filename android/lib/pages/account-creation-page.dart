import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/pages/main-page.dart';
import 'package:polydiff/services/user.dart';

class AccountCreationPage extends StatefulWidget {
  @override
  _AccountCreationPageState createState() => _AccountCreationPageState();
}

class _AccountCreationPageState extends State<AccountCreationPage> {
  final TextEditingController pseudo = TextEditingController();
  final TextEditingController email = TextEditingController();
  final TextEditingController password = TextEditingController();
  late TextFormField pseudoForm;
  late TextFormField emailForm;
  late TextFormField passwordForm1;
  late TextFormField passwordForm2;
  late AppBar _appBar;
  final _formKey = GlobalKey<FormState>();

  bool passwordIsHidden = true;
  void togglePasswordView() {
    setState(() {
      passwordIsHidden = !passwordIsHidden;
      print(passwordIsHidden);
    });
  }

  _AccountCreationPageState() {
    _appBar = AppBar(
      title: Text('Création de compte'),
      actions: <Widget>[
        ElevatedButton(
          child: Text('Valider la création du compte'),
          onPressed: () async {
            if (_formKey.currentState != null &&
                _formKey.currentState!.validate()) {
              int status = await submitUser();
              print(status);
              if (status == 409) {
                usernameUnavalaiblePopup();
              } else if (status == 201) {
                // TODO : Avatar selection here

                User.username = pseudo.text;
                Navigator.push(context,
                    MaterialPageRoute(builder: (context) => MainPage()));
              }
            }
          },
        ),
      ],
    );

    pseudoForm = TextFormField(
      controller: pseudo,
      decoration: InputDecoration(
        labelText: "Entrez votre pseudonyme",
      ),
      validator: (value) {
        RegExp regex = RegExp(r'^[a-zA-Z]+$');
        if (value == null ||
            value.isEmpty ||
            value.length > 16 ||
            !regex.hasMatch(value)) {
          return 'Le pseudonyme doit contenir entre 1 et 16 lettres.';
        }
        return null;
      },
    );

    emailForm = TextFormField(
      controller: email,
      decoration: InputDecoration(
        labelText: "Entrez votre courriel",
      ),
      validator: (value) {
        RegExp regex = RegExp(r'^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$');
        if (value == null ||
            value.length < 3 ||
            value.length > 254 ||
            !regex.hasMatch(value)) {
          return "Le courriel n'est pas valide";
        }
        return null;
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    passwordForm1 = TextFormField(
      controller: password,
      obscureText: passwordIsHidden,
      decoration: InputDecoration(
        labelText: 'Entrez votre mot de passe',
        suffixIcon: IconButton(
          onPressed: togglePasswordView,
          icon: Icon(
            passwordIsHidden ? Icons.visibility : Icons.visibility_off,
          ),
        ),
      ),
      validator: (value) {
        RegExp regex = RegExp(r'^[a-zA-Z0-9]+$');
        if (value == null ||
            value.length < 5 ||
            value.length > 8 ||
            !regex.hasMatch(value)) {
          return 'Le mot de passe doit contenir seulement des lettres et des chiffres et contenir entre 5 et 8 caractères';
        }
        return null;
      },
    );
    passwordForm2 = TextFormField(
      obscureText: passwordIsHidden,
      decoration: InputDecoration(
        labelText: 'Confirmez votre mot de passe',
        suffixIcon: IconButton(
          onPressed: togglePasswordView,
          icon: Icon(
            passwordIsHidden ? Icons.visibility : Icons.visibility_off,
          ),
        ),
      ),
      validator: (value) {
        if (value != password.text) {
          return 'Les mots de passe ne correspondent pas';
        }
        return null;
      },
    );

    return Scaffold(
        appBar: _appBar,
        body: SingleChildScrollView(
            child: Container(
          padding: EdgeInsets.all(20),
          width: MediaQuery.of(context).size.width,
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                pseudoForm,
                emailForm,
                passwordForm1,
                passwordForm2,
              ],
            ),
          ),
        )));
  }

// HTTP post to the server
  Future<int> submitUser() async {
    String url = '${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/new';
    print(url);
    final response = await http.post(
      Uri.parse(url),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode(<String, dynamic>{
        'username': pseudo.text,
        'password': password.text,
        'email': email.text,
      }),
    );
    return response.statusCode;
  }

  void usernameUnavalaiblePopup() {
    showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: Text('Erreur'),
            content: Text('Le pseudonyme ou le courriel est déjà utilisé.'),
            actions: <Widget>[
              TextButton(
                child: Text('OK'),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        });
  }
}
