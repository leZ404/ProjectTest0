import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/services/user.dart';

class LoginService {
  Future<int> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/login'),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode(<String, String>{
        'username': username,
        'password': password,
      }),
    );
    if (response.statusCode == 200) {
      User.username = username;
    }
    return response.statusCode;
  }
}
