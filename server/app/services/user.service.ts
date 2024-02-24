import { User } from '@common/user';
import * as fs from 'fs';
import { Service } from 'typedi';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

@Service()
export class UserService {
    usersFilePath = `../server/assets/users.json`;
    activeUsers: string[] = [];
    constructor() {
        console.log(this.activeUsers);
    }
    async getAllUsers(): Promise<User[] | []> {
        return new Promise((resolve, reject) => {
            fs.promises.readFile(this.usersFilePath, 'utf8')
                .then((fileData) => {
                    resolve(JSON.parse(fileData.toString()).users);
                })
                .catch(() => {
                    reject([]);
                });
        });
    }

    async validateUser(username: string, password: string): Promise<User | undefined> {
        if (this.activeUsers.includes(username)) {
            console.log('User is already logged in');
            return undefined;
        }

        const users: User[] = await this.getAllUsers();
        const user = await this.findUserByUsername(username, users);
        console.log(user, 'user');
        if (user && await bcrypt.compare(password, user.password)) {
            this.activeUsers.push(username);
            return user;
        }
        return undefined;
    }

    async findUserByUsername(username: string, users: User[]): Promise<User | undefined> {
        try {
            const user = users.find(u => u.username === username);
            return user;
        } catch (error) {
            console.error('Error reading the users file:', error);
            throw error;
        }
    }

    async createUser(user: User): Promise<User | undefined> {
        try {
            const users: User[] = await this.getAllUsers();

            if (await this.findUserByUsername(user.username, users) !== undefined) {
                console.log('User already exists');
                return undefined;
            }
            console.log(user.password)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            user.password = hashedPassword;
            users.push(user);
            this.activeUsers.push(user.username);
            fs.writeFileSync(this.usersFilePath, JSON.stringify({ users }));
            return user;
        } catch (error) {
            console.error('Error reading the users file:', error);
            throw error;
        }
    }

    generateToken(username: string): string {
        const token = jwt.sign({ username: username }, 'secretKey', { expiresIn: '1h' });
        return token;
    }

    logoutUser(username: string): boolean {
        console.log(this.activeUsers);
        const index = this.activeUsers.indexOf(username);
        if (index > -1) {
            this.activeUsers.splice(index, 1);
            return true;
        }
        return false;
    }
}
