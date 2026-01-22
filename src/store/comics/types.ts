import { ITom } from '@/components/Tom/types';
import { FilterItem } from '@/types/filter.type';

export enum Status {
  WORK = 'в процессе',
  FREEZED = 'заморожен',
  READY = 'завершён',
}

export interface IComics {
  title: string;
  description: string;
  covers: string[];
  banner: string;
  genres: FilterItem[];
  focus: FilterItem[];
  tags: FilterItem[];
  rating: FilterItem[];
  toms: ITom[];
  author: string;
  status: Status;
  roles: FilterItem[];
  id?: string;
  likes?: string[];
}

export interface IFilter {
  type: keyof Pick<IComics, 'focus' | 'genres' | 'rating' | 'tags' | 'roles'>;
  element: FilterItem;
}

export interface IUserComment {
  id: string;
  name: string;
  profileAvatar: string | null;
}

export interface IComicsComment {
  id: string;
  text: string;
  replyId: string | null;
  reply: IComicsComment | null;
  replies: IComicsComment[];
  likes: number;
  createdAt: string;
  User: IUserComment;
  userId: string;
}
