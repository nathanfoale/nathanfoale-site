NATHAN FOALE WEBSITE — UPLOAD GUIDE
====================================

This folder is a complete static website. It does not require Node, React,
WordPress, a database, or a build step.

HOW TO UPLOAD

1. Open your hosting provider’s file manager or connect by FTP/SFTP.
2. Find the website root folder. It is commonly named:
   - public_html
   - www
   - htdocs
3. Upload the CONTENTS of the "nathanfoale-website" folder into that root.
4. Keep the about, assets, blog, projects, prompt, and quant-lab folders exactly as they are.
5. Confirm that index.html is directly inside the website root.

EXPECTED STRUCTURE

public_html/
  index.html
  favicon.svg
  og.png
  about/
    index.html
  blog/
    index.html
    morality/
    religion/
    faith/
    free-will/
    western-anti-westernism/
  assets/
    site.css
    site.js
  projects/
    index.html
    assets/
      previews/
    blockchain-game/
      index.html
      game.css
      game.js
      og.png
  prompt/
    index.html
    services/
      index.html
    why-me/
      index.html
  quant-lab/
    index.html
    og.png

DOMAIN

The homepage metadata currently uses:
https://nathanfoale.com

If your domain is different, replace "https://nathanfoale.com" in the root
index.html file with the final domain.

NOTES

- Google Analytics ID G-P6E7QEZ6HX is included on every page.
- Blog is hosted natively under /blog/ with five individual essay pages.
- About contains Nathan's education, interests, and current areas of focus.
- Projects uses interactive case studies with visual previews, project details,
  technology tags, and direct launch links.
- Block Time is available under Projects. It uses a local probability simulation
  and optionally reads the current block height from mempool.space.
- SimuFi and Quant Lab display "coming soon" while their interactive models are
  still in development.
- The site uses Google Fonts, so internet access is needed to load those fonts.
  The website still works with system fonts if Google Fonts is unavailable.
