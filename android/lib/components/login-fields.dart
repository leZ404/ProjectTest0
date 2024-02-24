import 'package:flutter/material.dart';
import 'package:polydiff/services/login-service.dart';

import '../pages/main-page.dart';

class LoginFields extends StatefulWidget {
  @override
  _LoginFieldsState createState() => _LoginFieldsState();
}

class _LoginFieldsState extends State<LoginFields> {
  final TextEditingController username = TextEditingController();
  final TextEditingController password = TextEditingController();
  final LoginService loginService = LoginService();
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      child: Column(
        children: [
          HomeTextField(
              controller: username,
              labelText: "Entrez votre nom d'utilisateur"),
          HomeTextField(
              controller: password, labelText: "Entrez votre mot de passe"),
          ElevatedButton(
            onPressed: () async {
              final statusCode = await login();
              if (statusCode == 200) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => MainPage()),
                );
              } else {
                credentialsInvalidPopup(context);
              }
            },
            child: Text('Connexion'),
          ),
        ],
      ),
    );
  }

  login() async {
    return await loginService.login(username.text, password.text);
  }
}

class HomeTextField extends StatelessWidget {
  final String labelText;
  final TextEditingController controller;

  HomeTextField({required this.controller, required this.labelText});
  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        fillColor: Colors.white,
        filled: true,
        border: OutlineInputBorder(),
        labelText: labelText,
      ),
    );
  }
}

void credentialsInvalidPopup(BuildContext context) {
  showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Erreur'),
          content: Text('Les informations d\'identification sont invalides'),
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
