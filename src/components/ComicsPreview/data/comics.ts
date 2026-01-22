import data from '@/data/data.json';
import { IComics, Status } from '@/store/comics/types';
const defaultChapters = data.chapters;
export const comicsData: IComics = {
  title: 'Название',
  description: `Описание комикса. Avery is a vampire hunter! Who unfortunately gets bitten by and subsequently turned into, a vampire.
    Описание комикса. Avery is a vampire hunter! Who unfortunately gets bitten by and subsequently turned into, a vampire.
    Описание комикса. Avery is a vampire hunter! Who unfortunately gets bitten by and subsequently turned into, a vampire.
    Описание комикса. Avery is a vampire hunter! Who unfortunately gets bitten by and subsequently turned into, a vampire.`,
  covers: ['/post.svg', '/post.svg', '/post.svg'],
  banner: '',
  genres: [],
  focus: [],
  tags: [],
  roles: [],
  rating: [
    {
      colorClass: 'author',
      text: '18+',
    },
  ],
  toms: [
    {
      title: 'Том 0',
      tomId: '0',
      chapters: defaultChapters,
    },
  ],
  author: 'Автор',
  status: Status.WORK,
  likes: ['1'],
};
