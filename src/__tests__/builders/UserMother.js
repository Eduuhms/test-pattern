import { User } from '../../domain/User.js';

export class UserMother {
    static umUsuarioPadrao() {
        return new User(
            1,
            'João Silva',
            'joao@example.com',
            'PADRAO'
        );
    }

    static umUsuarioPremium() {
        return new User(
            2,
            'Maria Santos',
            'maria@example.com',
            'PREMIUM'
        );
    }
}
