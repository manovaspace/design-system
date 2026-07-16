import estedad400 from "@manovaspace/tokens/fonts/estedad-arabic-400-normal.woff2?url";
import estedad500 from "@manovaspace/tokens/fonts/estedad-arabic-500-normal.woff2?url";
import estedad600 from "@manovaspace/tokens/fonts/estedad-arabic-600-normal.woff2?url";
import inter400 from "@manovaspace/tokens/fonts/inter-latin-400-normal.woff2?url";
import inter500 from "@manovaspace/tokens/fonts/inter-latin-500-normal.woff2?url";

const FA_FONTS = [estedad400, estedad500, estedad600] as const;
const EN_FONTS = [inter400, inter500] as const;

export type OrbitFontsHeadProps = {
  locale: string;
};

export function OrbitFontsHead({ locale }: OrbitFontsHeadProps) {
  const fonts = locale === "fa" ? FA_FONTS : EN_FONTS;

  return (
    <>
      {fonts.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}
