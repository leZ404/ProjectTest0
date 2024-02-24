import { DatabaseService } from '@app/services/database.service';
import { UserService } from '@app/services/user.service';
import { consts } from '@common/consts';
import { User } from '@common/user';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
@Service()
export class UserFileSystemController {
    router: Router;

    constructor(private databaseService: DatabaseService, private userService: UserService) {
        this.configureRouter();
        databaseService.start();
    }
    destructor() {
        this.databaseService.closeConnection();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/fs/players/login', async (req: Request, res: Response) => {
            const userData = req.body as User;
            if (!userData) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const validation = await this.userService.validateUser(userData.username, userData.password);
                if (validation) {
                    const token = this.userService.generateToken(userData.username);
                    return res.status(consts.HTTP_STATUS_OK).json({ token, username: userData.username });
                } else {
                    return res.status(consts.HTTP_UNAUTHORIZED).json({ message: 'Erreur' });
                }
            } catch (error) {
                console.error("Erreur lors de la validation de l'utilisateur:", error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });

        this.router.post('/fs/players/new', async (req: Request, res: Response) => {
            const userData = req.body as User;
            console.log('userData', userData);
            if (!userData) {
                res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const user = await this.userService.createUser(userData);
                if (user) {
                    const token = this.userService.generateToken(userData.username);
                    return res.status(consts.HTTP_STATUS_CREATED).json({ token, username: userData.username });
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST).json({ message: "Nom d'utilisateur déjà pris" });
                }
            } catch (error) {
                console.error("Erreur lors de la création de l'utilisateur:", error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });
        this.router.patch('/fs/players/:username/logout', async (req: Request, res: Response) => {
            const username = req.params.username as string;
            console.log('username', username);

            if (!username) {
                return res.sendStatus(consts.HTTP_BAD_REQUEST);
            }
            try {
                const isLoggedOut = this.userService.logoutUser(username);
                if (isLoggedOut) {

                    console.log('disconnect');
                    return res.status(consts.HTTP_STATUS_OK).json({ message: 'Déconnexion réussie.' });
                } else {
                    return res.status(consts.HTTP_BAD_REQUEST).json({ message: 'Utilisateur non trouvé ou déjà déconnecté.' });
                }
            } catch (error) {
                console.error("Erreur lors de la déconnexion de l'utilisateur:", error);
                return res.status(consts.HTTP_SERVER_ERROR).json({ message: 'Erreur serveur' });
            }
        });
    }
}
