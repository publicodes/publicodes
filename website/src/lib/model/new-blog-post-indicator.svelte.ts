import { dayjs } from 'svelte-time/dayjs.js';

let lastBlogPostDate = $state(new Date(0));
let lastBlogVisit = $state(new Date());

try {
    const localStorageValue = window.localStorage.getItem('lastBlogVisit');
    if (localStorageValue) {
        lastBlogVisit = new Date(localStorageValue);
    } else {
        // If it's the first time that the user visits the blog,
        // then the new blog post indicator is shown
        // if the last blog post is less than a week old.
        lastBlogVisit = dayjs().subtract(1, 'week').toDate();
        window.localStorage.setItem('lastBlogVisit', lastBlogVisit.toISOString());
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    // ignore
}

export function setLastBlogPostDate(date: Date) {
    lastBlogPostDate = date;
}

export function blogVisited() {
    lastBlogVisit = new Date();

    try {
        window.localStorage.setItem('lastBlogVisit', lastBlogVisit.toISOString());
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        // ignore
    }
}

export function showBlogPostIndicator() {
    return lastBlogVisit < lastBlogPostDate;
}
