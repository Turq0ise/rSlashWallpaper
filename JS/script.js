let after = ``
let before = ``
let apiLink = ``

let prevBtn = `<i class="im im-angle-left-circle nav-btn" id="prev-btn" onclick="fetchRSlashWallpaper(false)"></i>`
let nextBtn = `<i class="im im-angle-right-circle nav-btn" id="next-btn" onclick="fetchRSlashWallpaper(true)"></i>`
let bothBtn

const lazyCount = 5
const postsCount = 30

async function fetchRSlashWallpaper(status) {
    if(status == null) {
        apiLink = `https://www.reddit.com/r/wallpaper.json?limit=${postsCount}&count=${postsCount}`
        bothBtn = nextBtn
    } else if(status) {
        apiLink = `https://www.reddit.com/r/wallpaper.json?limit=${postsCount}&count=${postsCount}&after=${after}`
        bothBtn = prevBtn + nextBtn
    } else if(!status) {
        apiLink = `https://www.reddit.com/r/wallpaper.json?limit=${postsCount}&count=${postsCount}&before=${before}`
        bothBtn = prevBtn + nextBtn
    }

    const fetchData = await fetch(apiLink)
    const jsonData = await fetchData.json()
    after = await jsonData.data.after
    before = await jsonData.data.before

    window.scrollTo(0, 0);
    
    if(document.getElementById("posts")) {
        document.getElementById("posts").remove()
        document.getElementById("btn-nav-section").remove()
    }

    let divPosts = document.createElement("div")
    divPosts.setAttribute("id", "posts")
    document.body.appendChild(divPosts)
    
    let i = 0
    jsonData.data.children.forEach(posts => {
        let imgUrl = posts.data.url
        let imgStr

        if(imgUrl == `https://www.reddit.com/gallery/${posts.data.id}`) { 
            let galleryUrl = posts.data.permalink.slice(0, -1)

            fetch(`https://www.reddit.com/${galleryUrl}.json`)
            .then(response => response.json())
            .then(object => {
                const path = object[0].data.children[0].data.media_metadata
                imgStr = ``
                let imgSliderCount = 0

                Object.entries(path).forEach(images => {
                    if (imgSliderCount == 0) {
                        imgStr += `<img id="active-img" src="https://i.redd.it/${images[0]}.${images[1].m.slice(6)}"></img>`;
                    } else if (i > lazyCount) {
                        imgStr += `<img id="" loading="lazy" src="https://i.redd.it/${images[0]}.${images[1].m.slice(6)}"></img>`;
                    } else {
                        imgStr += `<img id="" src="https://i.redd.it/${images[0]}.${images[1].m.slice(6)}"></img>`;
                    }

                    imgSliderCount++
                })

                document.getElementById("posts").innerHTML += `<div class="post" id="post-spec" onclick="imagePreview(this, true, event)"><div class="image-inner-section"><div class="image-slider"><i class="im im-angle-left" onclick="imageSlider(this, false)"></i><div class="img-container">${imgStr}</div><i class="im im-angle-right" onclick="imageSlider(this, true)"></i></div></div><div class="text-inner-section"><div class="container"><div class="left"><h1><a href="https://www.reddit.com${posts.data.permalink}" target="_blank">${posts.data.title}</a></h1><p>Posted by <a href="https://www.reddit.com/u/${posts.data.author}" target="_blank">u/${posts.data.author}</a></p><h3 class="image-counter">1/${imgSliderCount}</h3></div><i class="im im-x-mark" onclick=""></i></div></div></div>`
            })
        } else {
            if(i > lazyCount) {
                imgStr = `<img loading="lazy" src="${posts.data.url}"></img>`
            } else {
                imgStr = `<img src="${posts.data.url}"></img>`
            }

            document.getElementById("posts").innerHTML += `<div class="post" id="post-spec" onclick="imagePreview(this, true, event)"><div class="image-inner-section">${imgStr}</div><div class="text-inner-section"><div class="container"><div class="left"><h1><a href="https://www.reddit.com${posts.data.permalink}" target="_blank">${posts.data.title}</a></h1><p>Posted by <a href="https://www.reddit.com/u/${posts.data.author}" target="_blank">u/${posts.data.author}</a></p><h3 class="image-counter">1/1</h3></div><i class="im im-x-mark" onclick=""></i></div></div></div>`
        }
        i++
    })

    let divNav = document.createElement("div")
    divNav.setAttribute("id", "btn-nav-section")
    document.body.appendChild(divNav)
    divNav.innerHTML += bothBtn
}

function imagePreview(elem, status, event) {
    if(status) {
        let xMarkStr = elem.children[1].children[0].children[1].attributes["onclick"]
        elem.id = "preview"
        xMarkStr.nodeValue = "imagePreview(this, false, event)"
        elem.attributes["onclick"].nodeValue = ""
    } else if(!status) {
        let parentNodeStr = elem.parentNode.parentNode.parentNode
        parentNodeStr.id = "post-spec"
        elem.attributes["onclick"].nodeValue = ""
        parentNodeStr.attributes["onclick"].nodeValue = "imagePreview(this, true, event)"
    }
    event.stopPropagation()
}

let activeImgCount = 0
function imageSlider(elem, status) {
    const getImgContainer = elem.parentNode.children[1].children
    if (status) {
        getImgContainer[activeImgCount].id = ""
        if (activeImgCount + 1 == getImgContainer.length) {
            activeImgCount = 0
        } else {
            activeImgCount++
        }
        getImgContainer[activeImgCount].id = "active-img"
    } else if (!status) {
        getImgContainer[activeImgCount].id = ""
        if (activeImgCount == 0) {
            activeImgCount = getImgContainer.length - 1
        } else {
            activeImgCount--
        }
        getImgContainer[activeImgCount].id = "active-img"
    }
}

function colorThemeSwitcher(elem, status) {
    if(status) {
        document.documentElement.style.cssText = "--current-body-clr: var(--body-clr-l);--current-card-clr: var(--card-clr-l);--current-semi-clr: var(--semi-clr-l);--current-border-clr: var(--border-clr-l);--current-font-clr: var(--font-clr-d);";
        elem.children[0].style.fill = "rgb(0,0,0)"
        elem.attributes["onclick"].nodeValue = "colorThemeSwitcher(this, false)"
    } else if(!status) {
        document.documentElement.style.cssText = "--current-body-clr: var(--body-clr-d);--current-card-clr: var(--card-clr-d);--current-semi-clr: var(--semi-clr-d);--current-border-clr: var(--border-clr-d);--current-font-clr: var(--font-clr-l);";
        elem.children[0].style.fill = "rgb(255,255,255)"
        elem.attributes["onclick"].nodeValue = "colorThemeSwitcher(this, true)"
    }
}