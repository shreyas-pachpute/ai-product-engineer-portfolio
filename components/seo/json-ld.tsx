type JsonLdProps = {
  data: object;
};

/**
 * `dangerouslySetInnerHTML` is the correct, standard way to render a
 * `<script type="application/ld+json">` in React — a script tag's
 * content isn't something JSX children can express, and this is safe
 * here specifically because `data` is always our own trusted schema
 * object, never user input.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
