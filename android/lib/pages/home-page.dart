import 'package:flutter/material.dart';
import 'package:polydiff/components/login-fields.dart';

import 'account-creation-page.dart';

class HomePage extends StatelessWidget {
  final String appName = 'PolyDiff';

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;
    Row appTitleDisplay = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          'assets/images/logo1.png',
          height: screenHeight * 0.2,
        ),
        Text(
          appName,
          style: TextStyle(
              fontSize: screenWidth * 0.5 / appName.length,
              fontWeight: FontWeight.bold,
              color: Colors.white),
        ),
      ],
    );

    ElevatedButton accountCreationButton = ElevatedButton(
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => AccountCreationPage()),
        );
      },
      child: Text('Créer un compte'),
    );

    return Scaffold(
        backgroundColor: Colors.transparent,
        body: SingleChildScrollView(
          child: Center(
            child: Container(
              width: screenWidth * 0.8 > 200 ? screenWidth * 0.8 : 200,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  appTitleDisplay,
                  LoginFields(),
                  accountCreationButton,
                ],
              ),
            ),
          ),
        ));
  }
}
