import 'package:flutter/material.dart';

import '/components/message-sidebar.dart';
import 'user-portal-page.dart';

class MainPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return PopScope(
        canPop: false, // Prevents the user from navigating back

        child: LayoutBuilder(builder: (context, constraints) {
          return Scaffold(
              body: Container(
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/images/background.png'),
                fit: BoxFit.cover,
              ),
            ),
            child: Stack(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Center(
                      child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton(
                              onPressed: () {
                                print('button pressed!');
                              },
                              child: Text('Partie Classique'),
                            ),
                            SizedBox(height: 20),
                            ElevatedButton(
                              onPressed: () {
                                print('button pressed!');
                              },
                              child: Text('Partie temps limité'),
                            ),
                            SizedBox(height: 20),
                            ElevatedButton(
                              onPressed: () {
                                print('button pressed!');
                              },
                              child: Text('Paramètres'),
                            ),
                          ]),
                    ),
                    Center(
                      child:
                          OrientationBuilder(builder: (context, orientation) {
                        return Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Center(
                                child: Image.asset(
                                  'assets/images/logo1.png',
                                  width: orientation == Orientation.portrait
                                      ? null
                                      : constraints.maxWidth * 0.5,
                                  height: constraints.maxHeight * 0.5,
                                ),
                              )
                            ]);
                      }),
                    ),
                  ],
                ),
                MessageSideBar(),
                ProfilMenu(),
              ],
            ),
          ));
        }));
  }
}

class ProfilMenu extends StatelessWidget {
  const ProfilMenu({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          shape: CircleBorder(),
          padding: EdgeInsets.all(10),
        ),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => UserPortalPage()),
          );
        },
        child: Icon(
          Icons.account_circle_outlined,
          color: Theme.of(context).colorScheme.primary,
          size: 50,
        ),
      ),
    );
  }
}
