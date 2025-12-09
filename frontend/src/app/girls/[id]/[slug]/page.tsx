// Delegate to parent page and metadata; keep this file minimal to avoid duplicate default exports
export { generateMetadata } from '../page';
import GirlPage from '../page';

export default function GirlSlugPage({ params }: { params: { id: string; slug: string } }) {
  return <GirlPage params={Promise.resolve({ id: params.id, slug: params.slug })} />;
}
