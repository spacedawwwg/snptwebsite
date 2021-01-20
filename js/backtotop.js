//create smooth scroll on click

let toTopBtn = document.getElementById('back-top__content--desk');

toTopBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({top: 0, behavior: "smooth"});
});

//hide/show button on scroll up/down
let scrollPos = 0;

window.addEventListener('scroll', function () {

    // detects new state and compares it with the new one
    if ((document.body.getBoundingClientRect()).top > scrollPos) {
        console.log('scrolling down')

        document
            .getElementById('back-top')
            .classList
            .remove('active');

    } else {
        document
            .getElementById('back-top')
            .classList
            .add('active');
        console.log('scrolling up')
    }
    // saves the new position for iteration.
    scrollPos = (document.body.getBoundingClientRect()).top;
});