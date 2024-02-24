import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:polydiff/pages/home-page.dart';
import 'package:provider/provider.dart';

Future main() async {
  await dotenv.load(fileName: 'env/.env.dev'); // for development
  runApp(App());
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => AppState(),
      child: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/background.png'),
            fit: BoxFit.cover,
          ),
        ),
        child: MaterialApp(
          title: 'PolyDiff',
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
                seedColor: Color.fromARGB(255, 19, 51, 233)),
          ),
          home: HomePage(),
        ),
      ),
    );
  }
}

class AppState extends ChangeNotifier {}
