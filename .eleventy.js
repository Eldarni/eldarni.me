
//
const fs = require('fs');
const glob = require('glob');
const matter = require('gray-matter');

//plugins
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

//
const currentTime = new Date();

//
module.exports = function(eleventyConfig) {

    //copy over any font files
    eleventyConfig.addPassthroughCopy('src/fonts');

    //copy over any images
    eleventyConfig.addPassthroughCopy('src/images');

    //
    eleventyConfig.addGlobalData('currentTime', currentTime);

    //
    eleventyConfig.addFilter('filterTags', (tags) => {
        return tags.filter(tag => tag != 'post');
    });

    //
    eleventyConfig.addFilter('timestamp', (date) => {
        return String(date.toISOString());
    });

    //
    eleventyConfig.addFilter('year', (date) => {
        return String(date.getFullYear());
    });

    //
    eleventyConfig.addFilter('date', (date) => {
        return `${String(date.getFullYear())}-${String(date.getMonth()).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });

    //
    eleventyConfig.addFilter('time', (date) => {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });

    //
    eleventyConfig.addPlugin(syntaxHighlight);

    //use an after build event to create a copy of the latest post to be used as the homepage
    eleventyConfig.on('afterBuild', () => {

        //get the post date from the front-matter on each template
        const posts = glob.sync('./src/posts/**/*.njk').reduce((posts, post) => {
            const file = matter(fs.readFileSync(post));
            return [ ...posts, { 'filename' : post, 'date' : new Date(file.data.date) }];
        }, []);

        //get the latest post (by it's date front-matter)
        const latestPost = posts.sort((a, b) => b.date - a.date).at(0);

        //to get the filename of the post's artifact = convert the "./src/" to "./public/" and ".njk" to "/index.html"
        const latestPostArtifactFilename = latestPost.filename.replace('./src/', './public/').replace('.njk', '/index.html')
        
        fs.copyFile(latestPostArtifactFilename, './public/index.html', (err) => {
            if (err) throw err;
            console.log(`[11ty] Cloned ${latestPostArtifactFilename} as './public/index.html'`);
        });

    });

    //define the default input and output folders
    return {
        dir: {
            input: './src',
            output: './public/'
        }
    };

};