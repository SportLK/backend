import { User } from './user.entity';
export declare enum SportType {
    CRICKET = "CRICKET",
    FUTSAL = "FUTSAL",
    BADMINTON = "BADMINTON",
    BASKETBALL = "BASKETBALL"
}
export declare enum SkillLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED"
}
export declare class UserSportsInterest {
    id: string;
    userId: string;
    user: User;
    sportType: SportType;
    skillLevel: SkillLevel;
}
