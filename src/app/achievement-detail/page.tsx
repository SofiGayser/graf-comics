import AchievementDetail from '@/components/AchievementDetail';

type PageProps = {
  searchParams?: {
    title?: string;
    description?: string;
    image?: string;
  };
};

const safeDecode = (v?: string) => {
  try {
    return v ? decodeURIComponent(v) : undefined;
  } catch {
    return v;
  }
};

export default function AchievementDetailPage({ searchParams }: PageProps) {
  const { title, description, image } = searchParams ?? {};
  const decodedTitle = safeDecode(title);
  const decodedDescription = safeDecode(description);
  const decodedImage = safeDecode(image);

  return <AchievementDetail title={decodedTitle} description={decodedDescription} image={decodedImage} />;
}
