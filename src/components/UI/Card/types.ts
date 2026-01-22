export interface CardProps {
  text: string;
  mixClass?: string[];
  type?: 'new' | 'moder' | 'edit' | null;
  onClick?: () => void;
  imageSrc?: string;
  isLiked?: boolean;
  comicsId?: string;
  cover?: string;
  covers?: string[];
}
