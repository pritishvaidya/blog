---
title: A simple and more accurate estimation of Read Time  for Medium articles in
  JavaScript
date: "2019-01-30T17:37:47.357Z"
description: Read Time Estimate is the estimation of the time taken by the reader to read
  an article.
---

### Introduction

As explained in the [New
Yorker](https://www.newyorker.com/tech/annals-of-technology/a-list-of-reasons-why-our-brains-love-lists)

> The more we know about something — including precisely how much time it will
> consume — the greater the chance we will commit to it.

Knowing in advance how long an article helps with better time management by
allowing us to plan further ahead.

### Why should I use a new script?

Yes, there are many open source libraries available on [npm](https://npmjs.com) but they contain several flaws.

Before that, let's take a look at these two articles on Medium.
* [Read Time — Medium
Support](https://help.medium.com/hc/en-us/articles/214991667-Read-time)
* [Read Time and You](https://blog.medium.com/read-time-and-you-bc2048ab620c)

The above two articles have the following key features

* Average Read Time (English)—265 Words per min
* Average Read Time (Chinese, Japanese and Korean) — 500 Characters/min
* Image Read Time — 12 seconds for the first image, 11 for the second, and minus
an additional second for each subsequent image. Other images counted at 3
seconds.

Most of the libraries don’t account for the above features completely. They use
HTML strings as is without omitting its *tag names* which increases the
deviation of estimation from the original value.

### Code

The code can be split into two parts

* Constants
* Utility
* Main

#### Constants

The constants can be used as defaults to the main function. The image tag has
its own use which will be defined later.

```
  const WORDS_PER_MIN = 275; // wpm
  
  const IMAGE_READ_TIME = 12; // in seconds
  
  const CHINESE_KOREAN_READ_TIME = 500; // cpm
  
  const IMAGE_TAGS = ['img', 'Image'];
```

#### Utility Functions

##### Strip WhiteSpace #####

It is a simple utility function to remove all leading and trailing whitespace
from the string provided.

```
  function stripWhitespace(string) {
    return string.replace(/^\s+/, '').replace(/\s+$/, '');
  }
```

##### Image Read Time ##### 

It parses the string, looks for any HTML image tags based on the defaults
provided in the constants and returns the count.

If the image count is greater than 10, we calculate the image read time of first
10 images in decreasing arithmetic progression starting from 12 sec /
`customReadTime` provided by the user using the simple formula `n * (a+b) / 2`

and 3 sec for the remaining images.

```
  function imageCount(imageTags, string) {
    const combinedImageTags = imageTags.join('|');
    const pattern = `<(${combinedImageTags})([\\w\\W]+?)[\\/]?>`;
    const reg = new RegExp(pattern, 'g');
    return (string.match(reg) || []).length;
  }
  
  function imageReadTime(customImageTime = IMAGE_READ_TIME, tags = IMAGE_TAGS, string) {
    let seconds = 0;
    const count = imageCount(tags, string);
  
    if (count > 10) {
      seconds = ((count / 2) * (customImageTime + 3)) + (count - 10) * 3; // n/2(a+b) + 3 sec/image
    } else {
      seconds = (count / 2) * (2 * customImageTime + (1 - count)); // n/2[2a+(n-1)d]
    }
    return {
      time: seconds / 60,
      count,
    };
  }
```

##### Strip Tags ##### 

Next, we check for any HTML tags (both)in the string and remove it to extract
only the words from it. 

```
  function stripTags(string) {
    const pattern = '<\\w+(\\s+("[^"]*"|\\\'[^\\\']*\'|[^>])+)?>|<\\/\\w+>';
    const reg = new RegExp(pattern, 'gi');
    return string.replace(reg, '');
  }
```

##### Words Read Time ##### 

This utility function calculates the words count and *Chinese / Korean and
Japanese* characters using the different *Unicode* character range.

The time is calculated by dividing it with the constants defined above.

```
  function wordsCount(string) {
    const pattern = '\\w+';
    const reg = new RegExp(pattern, 'g');
    return (string.match(reg) || []).length;
  }
  
  // Chinese / Japanese / Korean
  function otherLanguageReadTime(string) {
    const pattern = '[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]';
    const reg = new RegExp(pattern, 'g');
    const count = (string.match(reg) || []).length;
    const time = count / CHINESE_KOREAN_READ_TIME;
    const formattedString = string.replace(reg, '');
    return {
      count,
      time,
      formattedString,
    };
  }
  
  function wordsReadTime(string, wordsPerMin = WORDS_PER_MIN) {
    const {
      count: characterCount,
      time: otherLanguageTime,
      formattedString,
    } = otherLanguageReadTime(string);
    const wordCount = wordsCount(formattedString);
    const wordTime = wordCount / wordsPerMin;
    return {
      characterCount,
      otherLanguageTime,
      wordTime,
      wordCount,
    };
  }
```

##### Humanize Time #####

Based on the [distance of time in
words](https://api.rubyonrails.org/classes/ActionView/Helpers/DateHelper.html#method-i-distance_of_time_in_words),
we can calculate and return the humanized duration of the time taken to read.

```
  function humanizeTime(time) {
    if (time < 0.5) {
      return 'less than a minute';
    } if (time >= 0.5 && time < 1.5) {
      return '1 minute';
    }
    return `${Math.ceil(time)} minutes`;
  }

```

#### Main

The main function only consolidates all the utility methods in the correct
order.

```
  function readTime(
    string,
    customWordTime,
    customImageTime,
    chineseKoreanReadTime,
    imageTags,
  ) {
    const { time: imageTime, count: imageCount } = imageReadTime(customImageTime, imageTags, string);
    const strippedString = stripTags(stripWhitespace(string));
    const {
      characterCount,
      otherLanguageTime,
      wordTime,
      wordCount,
    } = wordsReadTime(strippedString, customWordTime);
    return {
      humanizedDuration: humanizeTime(imageTime + wordTime),
      duration: imageTime + wordTime,
      totalWords: wordCount,
      wordTime,
      totalImages: imageCount,
      imageTime,
      otherLanguageTimeCharacters: characterCount,
      otherLanguageTime,
    };
  }
```

### How much accurate is this script?

Taking the tests on the HTML string (from the chrome inspector) **before this
article section.**

![read_time_1](/read_time_1.png)

![read_time_2](/read_time_2.png)

The tests and the [Pages](https://www.apple.com/in/pages/) clearly give the
correct estimate about the total words from the parsed HTML and the number of
images. 

### Links

I’ve consolidated the complete code on
[GitHub](https://github.com/pritishvaidya/read-time-estimate). It is also
available as an npm package
[read-time-estimate](https://www.npmjs.com/package/read-time-estimate).