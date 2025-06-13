
const puppeteer = require('puppeteer');

const BASE_URL = 'https://clutch.co';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,  // Open browser window so you can see it
    slowMo: 50,       // Slow down actions slightly for visibility
    defaultViewport: null,  // Use the default viewport for better visibility
    args: ['--disable-blink-features=AutomationControlled']  // Prevent detection as automation
  });

  const page = await browser.newPage();

  // Randomize User-Agent to mimic a real browser
  const randomUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  await page.setUserAgent(randomUserAgent);

  let currentPage = 1;
  let totalPages = 581;

  while (currentPage <= totalPages) {
    const url = `https://clutch.co/it-services/system-integrators?page=${currentPage}`;
    console.log(`🔗 Scraping page: ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('✅ Page opened');

    await page.waitForSelector('#providers2 #providers__section ul');

    const hrefs = await page.$$eval(
      '#providers2 #providers__section ul > li div div.provider__cta-container',
      lis => lis.map(li => {
        const firstAnchor = li.querySelector('a');
        return firstAnchor ? firstAnchor.getAttribute('href') : null;
      }).filter(Boolean) // Filter out null values
    );

    console.log(`🔗 Found ${hrefs.length} profile links`);

    for (const href of hrefs) {
      const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
      console.log(`➡️ Opening profile: ${fullUrl}`);

      const newPage = await browser.newPage();
      await newPage.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      console.log(`🔗 Scraping reviews from profile: ${fullUrl}`);

      try {
        await newPage.waitForSelector('#reviews', { timeout: 10000 });
        const totalReviewPages = await newPage.$$eval(
          '#reviews .sg-accordion__contents .profile-reviews--list .profile-reviews--pagination a',
          links => {
            const pages = links.map(link => link.innerText.trim());
            return pages.length > 1 ? pages[pages.length - 2] : '1'; // Return second-to-last page or 1 if there's only 1 page
          }
        );

        console.log(`📝 Total Review Pages: ${totalReviewPages}`);
        const reviewsData = await newPage.$$eval(
          '#reviews .sg-accordion__contents #reviews-list article', // Select each review article
          articles => articles.map(article => {
            const category = article.querySelector('li:nth-child(1) span:nth-child(2)') ?
              article.querySelector('li:nth-child(1) span:nth-child(2)').innerText.trim() : 'Not available';

            const confidential = article.querySelector('li:nth-child(2)') ?
              article.querySelector('li:nth-child(2)').innerText.trim() : 'Not available';

            const date = article.querySelector('li:nth-child(3)') ?
              article.querySelector('li:nth-child(3)').innerText.trim() : 'Not available';

            const projectSummary = article.querySelector('.profile-review__summary.mobile_hide p:nth-of-type(2)') ?
              article.querySelector('.profile-review__summary.mobile_hide p:nth-of-type(2)').innerText.trim() : 'Not available';

            const review = article.querySelector('.profile-review__quote') ?
              article.querySelector('.profile-review__quote').innerText.trim() : 'Not available';

            const feedback = article.querySelector('.profile-review__feedback.mobile_hide p:nth-of-type(2)') ?
              article.querySelector('.profile-review__feedback.mobile_hide p:nth-of-type(2)').innerText.trim() : 'Not available';

            const reviewerPosition = article.querySelector('.profile-review__reviewer.mobile_hide div:nth-child(1)') ?
              article.querySelector('.profile-review__reviewer.mobile_hide div:nth-child(1)').innerText.trim() : 'Not available';

            const reviewerName = article.querySelector('.profile-review__reviewer.mobile_hide .reviewer_card .reviewer_card--name') ?
              article.querySelector('.profile-review__reviewer.mobile_hide .reviewer_card .reviewer_card--name').innerText.trim() : 'Not available';

            const reviewerDetails = article.querySelectorAll('.profile-review__reviewer.mobile_hide ul.reviewer_list li');
            const companyCategory = reviewerDetails[0] ? reviewerDetails[0].querySelector('span:nth-of-type(2)').innerText.trim() : 'Not available';
            const location = reviewerDetails[1] ? reviewerDetails[1].querySelector('span:nth-of-type(2)').innerText.trim() : 'Not available';
            const companySize = reviewerDetails[2] ? reviewerDetails[2].querySelector('span:nth-of-type(2)').innerText.trim() : 'Not available';

            return {
              category, confidential, date, projectSummary, review, feedback,
              reviewerPosition, reviewerName, companyCategory, location, companySize
            };
          })
        );

        if (reviewsData.length === 0) {
          console.log('⚠️ No reviews found on this profile.');
        } else {
          console.log(`📝 Found ${reviewsData.length} reviews:`);
          reviewsData.forEach((review, i) => {
            console.log(`  Review ${i + 1}:`);
            console.log(`    Category: ${review.category}`);
            console.log(`    Confidential: ${review.confidential}`);
            // console.log(`    Date: ${review.date}`);
            // console.log(`    Project Summary: ${review.projectSummary}`);
            // console.log(`    Review: ${review.review}`);
            // console.log(`    Feedback: ${review.feedback}`);
            // console.log(`    Reviewer Position: ${review.reviewerPosition}`);
            // console.log(`    Reviewer Name: ${review.reviewerName}`);
            // console.log(`    Company Category: ${review.companyCategory}`);
            // console.log(`    Location: ${review.location}`);
            // console.log(`    Company Size: ${review.companySize}`);
            console.log('_____________________________________________');
          });
        }
      } catch (err) {
        console.log('⚠️ Reviews section not found or timeout.');
      }

      await newPage.close();
      console.log(`⏩ Moving to next profile.`);
    }

    currentPage++;
    console.log(`➡️ Moving to next page: ${currentPage}`);
  }

  await browser.close();
  console.log('✅ Done opening all profile links and scraping reviews');
})();



// const puppeteer = require('puppeteer');
//
// const BASE_URL = 'https://clutch.co';
//
// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     slowMo: 50,
//     defaultViewport: null,
//     args: ['--disable-blink-features=AutomationControlled']
//   });
//   const page = await browser.newPage();
//   const randomUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
//   await page.setUserAgent(randomUserAgent);
//   let currentPage = 1;
//   let totalPages = 581;
//   while (currentPage <= totalPages) {
//     const url = `https://clutch.co/it-services/system-integrators?page=${currentPage}`;
//     console.log(`🔗 Scraping page: ${url}`);
//     await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
//     console.log('✅ Page opened');
//     await page.waitForSelector('#providers2 #providers__section ul');
//     const hrefs = await page.$$eval(
//       '#providers2 #providers__section ul > li div div.provider__cta-container',
//       lis => lis.map(li => {
//         const firstAnchor = li.querySelector('a');
//         return firstAnchor ? firstAnchor.getAttribute('href') : null;
//       }).filter(Boolean) // Filter out null values
//     );
//     console.log(`🔗 Found ${hrefs.length} profile links`);
//     for (const href of hrefs) {
//       const fullUrl = href.startsWith('http') ? href : BASE_URL + href;
//       console.log(`➡️ Opening profile: ${fullUrl}`);
//       const newPage = await browser.newPage();
//       await newPage.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
//       try {
//         await newPage.waitForSelector('#reviews', { timeout: 10000 });
//         const reviewsData = await newPage.$$eval(
//           '#reviews .sg-accordion__contents #reviews-list article', // Select each review article
//           articles => articles.map(article => {
//             const category = article.querySelector('li:nth-child(1) span:nth-child(2)') ?
//               article.querySelector('li:nth-child(1) span:nth-child(2)').innerText.trim() : 'Not available';
//             const confidential = article.querySelector('li:nth-child(2)') ?
//               article.querySelector('li:nth-child(2)').innerText.trim() : 'Not available';
//             const date = article.querySelector('li:nth-child(3)') ?
//               article.querySelector('li:nth-child(3)').innerText.trim() : 'Not available';
//             const projectSummary = article.querySelector('.profile-review__summary.mobile_hide p:nth-of-type(2)') ?
//               article.querySelector('.profile-review__summary.mobile_hide p:nth-of-type(2)').innerText.trim() : 'Not available';
//             const review = article.querySelector('.profile-review__quote') ?
//               article.querySelector('.profile-review__quote').innerText.trim() : 'Not available';
//             const feedback = article.querySelector('.profile-review__feedback.mobile_hide p:nth-of-type(2)') ?
//               article.querySelector('.profile-review__feedback.mobile_hide p:nth-of-type(2)').innerText.trim() : 'Not available';
//             const reviewerPosition = article.querySelector('.profile-review__reviewer.mobile_hide div:nth-child(1)') ?
//               article.querySelector('.profile-review__reviewer.mobile_hide div:nth-child(1)').innerText.trim() : 'Not available';
//             const reviewerName = article.querySelector('.profile-review__reviewer.mobile_hide .reviewer_card .reviewer_card--name') ?
//               article.querySelector('.profile-review__reviewer.mobile_hide .reviewer_card .reviewer_card--name').innerText.trim() : 'Not available';
//             const reviewerDetails = article.querySelectorAll('.profile-review__reviewer.mobile_hide ul.reviewer_list li');
//             const companyCategory = reviewerDetails[0] ? reviewerDetails[0].querySelector('span:nth-of-type(2)').innerText.trim() : 'Not available';
//             const location = reviewerDetails[1] ? reviewerDetails[1].querySelector('span:nth-of-type(2)').innerText.trim() : 'Not available';
//             const companySize = reviewerDetails[2] ? reviewerDetails[2].querySelector('span:nth-of-type(2)').innerText.trim() : 'Not available';
//             return {
//               category, confidential, date, projectSummary, review, feedback,
//               reviewerPosition, reviewerName, companyCategory, location, companySize
//             };
//           })
//         );
//         if (reviewsData.length === 0) {
//           console.log('⚠️ No reviews found on this profile.');
//         } else {
//           console.log(`📝 Found ${reviewsData.length} reviews:`);
//           reviewsData.forEach((review, i) => {
//             console.log(`  Review ${i + 1}:`);
//             console.log(`    Category: ${review.category}`);
//             console.log(`    Confidential: ${review.confidential}`);
//             console.log(`    Date: ${review.date}`);
//             console.log(`    Project Summary: ${review.projectSummary}`);
//             console.log(`    Review: ${review.review}`);
//             console.log(`    Feedback: ${review.feedback}`);
//             console.log(`    Reviewer Position: ${review.reviewerPosition}`);
//             console.log(`    Reviewer Name: ${review.reviewerName}`);
//             console.log(`    Company Category: ${review.companyCategory}`);
//             console.log(`    Location: ${review.location}`);
//             console.log(`    Company Size: ${review.companySize}`);
//             console.log('_____________________________________________');
//           });
//         }
//       } catch (err) {
//         console.log('⚠️ Reviews section not found or timeout.');
//       }
//       await new Promise(resolve => setTimeout(resolve, 3000));
//       await newPage.close();
//     }
//     currentPage++;
//     console.log(`➡️ Moving to next page: ${currentPage}`);
//   }
//   await browser.close();
//   console.log('✅ Done opening all profile links and scraping reviews');
// })();
//
//
