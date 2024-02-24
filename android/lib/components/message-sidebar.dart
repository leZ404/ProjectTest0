import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:polydiff/services/user.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class MessageSideBar extends StatefulWidget {
  const MessageSideBar({
    super.key,
  });

  @override
  State<MessageSideBar> createState() => _MessageSideBarState();
}

class _MessageSideBarState extends State<MessageSideBar> {
  var showChatBox = false;
  var showChatList = true;
  var chatMessages = [];
  var chatSelected = {};
  var chatsList = [];
  var filteredChatsList = [];
  var _toggleButtonSelected = [true, false, false];
  final socket = IO.io(dotenv.env['SERVER_URL_AND_PORT'], <String, dynamic>{
    'autoConnect': false,
    'transports': ['websocket'],
  });
  final textController = TextEditingController();
  final ScrollController scrollCont = ScrollController();
  final txtFieldFocusNode = FocusNode();

  void scrollDown() {
    print('inScrollDown');
    scrollCont.animateTo(
      scrollCont.position.maxScrollExtent,
      duration: Duration(seconds: 1),
      curve: Curves.fastOutSlowIn,
    );
  }

  @override
  void initState() {
    super.initState();
    initSocket();
  }

  @override
  void dispose() {
    textController.dispose();
    socket.dispose();
    super.dispose();
  }

  initSocket() {
    socket.connect();
    socket.onConnect((_) => print("Connection established"));
    socket.onDisconnect((_) => print("connection Disconnection"));
    socket.onConnectError((err) => print(err));
    socket.onError((err) => print(err));

    socket.on('updatedChatList', (data) {
      setState(() {
        chatsList = data;
        filteredChatsList = chatsList;
      });
    });

    socket.on('updatedHistory', (data) {
      setState(() {
        if (chatSelected['name'] == data['name']) {
          chatMessages = data['history'];
        }
      });
      scrollDown();
    });

    socket.emit('getChatList');
  }

  chatDisplay(int index) {
    setState(() {
      chatSelected = chatsList[index];
      socket.emit('getChatHistory', chatSelected['name']);
      print(chatSelected);
      showChatList = false;
    });
  }

  removeTempChat() {
    setState(() {
      filteredChatsList.removeWhere((element) => element['name'] == 'temp');
    });
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      return showChatBox
          ? Align(
              alignment: Alignment.bottomRight,
              child: Container(
                  height: constraints.maxHeight * 0.7,
                  width: constraints.maxWidth * 0.27,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                      topRight: Radius.circular(10),
                    ),
                    color: Colors.white,
                  ),
                  child: Column(children: [
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () {
                            setState(() {
                              showChatList = true;
                            });
                          },
                          child: Icon(Icons.arrow_back_rounded),
                        ),
                        Text(
                          'Chat',
                          style: TextStyle(
                              fontSize: 25,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary),
                        ),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              showChatBox = false;
                            });
                          },
                          child: Icon(Icons.horizontal_rule_rounded),
                        ),
                      ],
                    ),
                    if (showChatList) ...[
                      Row(children: [
                        ToggleButtons(
                            isSelected: _toggleButtonSelected,
                            borderColor: Colors.black54,
                            selectedBorderColor: Colors.black,
                            onPressed: (int index) {
                              setState(() {
                                for (int buttonIndex = 0;
                                    buttonIndex < _toggleButtonSelected.length;
                                    buttonIndex++) {
                                  if (buttonIndex == index) {
                                    _toggleButtonSelected[buttonIndex] = true;
                                  } else {
                                    _toggleButtonSelected[buttonIndex] = false;
                                  }
                                }
                              });
                            },
                            borderRadius: BorderRadius.circular(10),
                            children: [
                              Icon(Icons.groups_2_sharp),
                              Icon(Icons.group_sharp),
                              Icon(Icons.group_outlined),
                            ]),
                        Spacer(),
                        OutlinedButton(
                            onPressed: () {
                              setState(() {
                                filteredChatsList.add({'name': 'temp'});
                              });
                            },
                            style: OutlinedButton.styleFrom(
                              padding: EdgeInsets.all(10),
                              foregroundColor: Colors.green,
                            ),
                            child: Icon(Icons.group_add_outlined)),
                      ]),
                      TextField(
                        decoration: InputDecoration(
                          labelText: 'Rechercher un canal',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (value) {
                          setState(() {
                            filteredChatsList = chatsList
                                .where((element) => element['name']
                                    .toLowerCase()
                                    .contains(value.toLowerCase()))
                                .toList();
                          });
                        },
                      ),
                      ChatList(
                          showChatMessages: chatDisplay,
                          filteredChatsList: filteredChatsList,
                          chatsList: chatsList,
                          removeTempChat: removeTempChat,
                          socket: socket),
                    ] else ...[
                      ChatMessages(
                        chatMessages: chatMessages,
                        textController: textController,
                        socket: socket,
                        scrollCont: scrollCont,
                        txtFieldFocusNode: txtFieldFocusNode,
                        chatSelected: chatSelected,
                      ),
                    ]
                  ])),
            )
          : Align(
              alignment: Alignment.bottomRight,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  shape: CircleBorder(),
                  padding: EdgeInsets.all(10),
                ),
                onPressed: () {
                  setState(() {
                    showChatBox = true;
                  });
                },
                child: Icon(
                  Icons.message_outlined,
                  color: Theme.of(context).colorScheme.primary,
                  size: 50,
                ),
              ),
            );
    });
  }
}

class ChatMessages extends StatelessWidget {
  const ChatMessages({
    super.key,
    required this.chatMessages,
    required this.textController,
    required this.socket,
    required this.scrollCont,
    required this.txtFieldFocusNode,
    required this.chatSelected,
  });

  final List chatMessages;
  final TextEditingController textController;
  final IO.Socket socket;
  final ScrollController scrollCont;
  final FocusNode txtFieldFocusNode;
  final chatSelected;

  void sendMessage() {
    textController.text.trim() != ''
        ? socket.emit('updateChatHistory', {
            'senderType': 1,
            'sender': User.username,
            'body': textController.text,
            'time': DateTime.now().toString().split('.')[0].split(' ')[1],
            'chatName': '${chatSelected['name']}'
          })
        : print('empty message');
    textController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
        child: Column(
      children: [
        Expanded(
          child: ListView(
            controller: scrollCont,
            children: [
              for (var i in chatMessages)
                i['sender'] == 'SYSTEM'
                    ? Text(i['body'],
                        style: TextStyle(
                          fontSize: 15,
                          color: Theme.of(context).colorScheme.secondary,
                        ),
                        textAlign: TextAlign.center)
                    : Card(
                        child: ListTile(
                          leading: i['sender'] == User.username
                              ? null
                              : Image.asset('assets/images/avatar1.png'),
                          trailing: i['sender'] == User.username
                              ? Image.asset('assets/images/avatar3.png')
                              : null,
                          title: Text(i['body'],
                              textAlign: i['sender'] == User.username
                                  ? TextAlign.right
                                  : TextAlign.left),
                          subtitle: Text(i['sender'] + ' ' + i['time'],
                              style: TextStyle(fontSize: 10),
                              textAlign: i['sender'] == User.username
                                  ? TextAlign.right
                                  : TextAlign.left),
                          tileColor: i['sender'] == User.username
                              ? Theme.of(context).colorScheme.primary
                              : Theme.of(context).colorScheme.secondary,
                          textColor: i['sender'] == User.username
                              ? Theme.of(context).colorScheme.onPrimary
                              : Theme.of(context).colorScheme.onSecondary,
                        ),
                      )
            ],
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: TextField(
            focusNode: txtFieldFocusNode,
            controller: textController,
            decoration: InputDecoration(
              hintText: 'Type a message',
              border: OutlineInputBorder(),
              suffixIcon: IconButton(
                onPressed: () {
                  sendMessage();
                },
                icon: Icon(Icons.send),
              ),
            ),
            onSubmitted: (value) {
              sendMessage();
              txtFieldFocusNode.requestFocus();
            },
          ),
        )
      ],
    ));
  }
}

class ChatList extends StatelessWidget {
  final Function(int) showChatMessages;
  final Function() removeTempChat;
  final List chatsList;
  final List filteredChatsList;
  final IO.Socket socket;
  const ChatList(
      {super.key,
      required this.showChatMessages,
      required this.chatsList,
      required this.removeTempChat,
      required this.socket,
      required this.filteredChatsList});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: ListView.builder(
        itemCount: filteredChatsList.length,
        itemBuilder: (context, index) {
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: BorderSide(
                color: Theme.of(context).colorScheme.secondary,
              ),
            ),
            onPressed: () {
              showChatMessages(index);
            },
            child: filteredChatsList[index]['name'] == 'temp'
                ? TextField(
                    decoration: InputDecoration(
                      labelText: 'Nom du canal',
                    ),
                    onTapOutside: (event) {
                      removeTempChat();
                    },
                    onSubmitted: (value) {
                      if (value.trim() == '' ||
                          value == 'temp' ||
                          chatsList
                              .any((element) => element['name'] == value)) {
                        removeTempChat();
                        return;
                      }
                      socket.emit('createChat', {
                        'name': value,
                        'creator': User.username,
                        'history': [
                          {
                            'senderType': 0,
                            'sender': 'SYSTEM',
                            'body': 'Welcome to the $value chat!',
                            'time': DateTime.now()
                                .toString()
                                .split('.')[0]
                                .split(' ')[1],
                          }
                        ],
                      });
                      removeTempChat();
                    },
                  )
                : Text(filteredChatsList[index]['name'],
                    style: TextStyle(
                      fontSize: 20,
                      color: Theme.of(context).colorScheme.secondary,
                    )),
          );
        },
      ),
    );
  }
}
