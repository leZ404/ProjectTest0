import 'package:flutter/material.dart';

class AvatarSelector extends StatefulWidget {
  AvatarSelector() {}
  @override
  _AvatarSelectorState createState() => _AvatarSelectorState();
}

class _AvatarSelectorState extends State<AvatarSelector> {
  int? _selectedRadioTile = 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: 200,
        child: Column(
          children: [
            RadioListTile(
              value: 1,
              groupValue: _selectedRadioTile,
              title:
                  Image.asset('assets/images/avatar1.png', fit: BoxFit.cover),
              onChanged: (val) {
                setState(() {
                  _selectedRadioTile = val as int?;
                });
              },
            ),
            RadioListTile(
              value: 2,
              groupValue: _selectedRadioTile,
              title:
                  Image.asset('assets/images/avatar2.png', fit: BoxFit.cover),
              onChanged: (val) {
                setState(() {
                  _selectedRadioTile = val as int?;
                });
              },
            ),
            RadioListTile(
              value: 3,
              groupValue: _selectedRadioTile,
              title:
                  Image.asset('assets/images/avatar3.png', fit: BoxFit.cover),
              onChanged: (val) {
                setState(() {
                  _selectedRadioTile = val as int?;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}
