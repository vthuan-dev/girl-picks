interface StructuredDataProps {
  type: 'WebSite' | 'Organization' | 'BreadcrumbList' | 'ItemList' | 'VideoObject' | 'ImageObject';
  data: Record<string, any>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

