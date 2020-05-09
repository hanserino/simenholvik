var isTouchDevice = function () {
    return (
        !!(typeof window !== 'undefined' &&
            ('ontouchstart' in window ||
                (window.DocumentTouch &&
                    typeof document !== 'undefined' &&
                    document instanceof window.DocumentTouch))) ||
        !!(typeof navigator !== 'undefined' &&
            (navigator.maxTouchPoints || navigator.msMaxTouchPoints))
    );
};


$.fn.moveIt = function(){
    var $window = $(window);
    var instances = [];
    
    $(this).each(function(){
      instances.push(new moveItItem($(this)));
    });
    
    window.addEventListener('scroll', function(){
      var scrollTop = $window.scrollTop();
      instances.forEach(function(inst){
        inst.update(scrollTop);
      });
    }, {passive: true});
  }
  
  var moveItItem = function(el){
    this.el = $(el);
    this.speed = parseInt(this.el.attr('data-scroll-speed'));
  };
  
  moveItItem.prototype.update = function(scrollTop){
    this.el.css('transform', 'translateY(' + -(scrollTop / this.speed) + 'px)');
  };
  

function init(){
    var mediumPostsEl = document.getElementById('medium-posts-container');
    var mediumPostsTitleEl = document.getElementById('medium-posts-title');
    var mediumPostListContainerEl = document.getElementById('medium-post-list-container');
    
    if(mediumPostsEl){
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@simen.holvik')
        .then((res) => res.json())
        .then((data) => {
                mediumPostsEl.dataset.fetchSuccess = true;
                mediumPostsTitleEl.innerHTML = "";

            // Filter for acctual posts. Comments don't have categories, therefore can filter for items with categories bigger than 0
            const res = data.items //This is an array with the content. No feed, no info about author etc..
            const posts = res.filter(item => item.categories.length > 0) // That's the main trick* !

            // Functions to create a short text out of whole blog's content
            function toText(node) {
                let tag = document.createElement('div')
                tag.innerHTML = node
                node = tag.innerText
                return node
            }
            function shortenText(text,startingPoint ,maxLength) {
                return text.length > maxLength?
                text.slice(startingPoint, maxLength):
                text
            }

            // Put things in right spots of markup
            let output = '';
            posts.forEach((item) => {
                    console.log(item)
                    let publishedDate = moment(shortenText(item.pubDate,0 ,10)).locale('nb').format('Do MMMM YYYY');
                    output += `
                    <li>
                        <a href="${item.link}">
                            <span class="medium-article-date">${publishedDate}</span>
                            <h3 class="medium-article-title">${item.title}</h3>
                            <p class="medium-article-subtitle">${shortenText(toText(item.content),0, 200)+ '...'}</p>
                        <a/>
                    </li>`
            })
            mediumPostListContainerEl.innerHTML = output
        })
    }
    
}



window.onload = function () {
    init();
    
    var touchClass = isTouchDevice() ? "touch" : "no-touch";
    document.body.classList.add(touchClass);

    if(!isTouchDevice() && $(window).width() >= 900 ){
        $(function(){
            $('[data-scroll-speed]').moveIt();
        });
    }

    document.body.classList.add("loaded");

}
