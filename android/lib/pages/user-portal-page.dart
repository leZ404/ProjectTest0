import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/pages/home-page.dart';
import 'package:polydiff/services/user.dart';

class UserPortalPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('User Portal'),
        actions: <Widget>[
          ElevatedButton(
            onPressed: () async {
              int res = await logout();
              User.username = '';
              print(res);
              Navigator.push(
                  context, MaterialPageRoute(builder: (context) => HomePage()));
            },
            child: Text('Déconnexion'),
          ),
        ],
      ),
    );
  }

  Future<int> logout() async {
    print('User.username: ${User.username}');
    String url =
        '${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/${User.username}/logout';
    final response = await http.patch(
      Uri.parse(url),
    );
    return response.statusCode;
  }
}
