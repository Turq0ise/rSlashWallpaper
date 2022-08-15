const lazyCount = 5
const postsCount = 50
let after = ``

window.onload = () => {
    const searchValue = window.location.search
    if(searchValue === "") {
        fetchRSlashWallpaper(`https://www.reddit.com/r/wallpaper/new.json?limit=${postsCount}&count=${postsCount}`)
    } else {
        let searchQuery = searchValue.split("?search=").pop().replace(/\+/g, "%20")
        fetchRSlashWallpaper(`https://www.reddit.com/r/wallpaper/search.json?sort=new&q=${searchQuery}&limit=${postsCount}&count=${postsCount}&restrict_sr=true`)
    }
}

window.onscroll = () => {
    let scrollValue = 110
    let getHeaderText = document.getElementsByClassName("header-text")

    if(document.body.scrollTop > scrollValue || document.documentElement.scrollTop > scrollValue) {
        for(let i = 0; i < getHeaderText.length; i++) {
            getHeaderText[i].setAttribute("style", "font-size:calc(clamp(1.8rem, 2.2vw, 3.8rem) - 2px)")
        }
    } else {
        for(let i = 0; i < getHeaderText.length; i++) {
            getHeaderText[i].removeAttribute("style")
        }
    }
}

let getHeaderSection = document.getElementById("header")
let getPostsSection = document.getElementById("posts")
let borderValue = 2

async function fetchRSlashWallpaper(apiLink, status) {
    let spaceCorrectionValue = `${getHeaderSection.clientHeight + borderValue}px`
    getPostsSection.style.paddingTop = spaceCorrectionValue

    if(status) {
        document.getElementById("btn-nav-section").remove()
    }

    const fetchData = await fetch(apiLink)
    const jsonData = await fetchData.json()
    after = await jsonData.data.after

    let i = 0
    jsonData.data.children.forEach(posts => {
        let mainData = posts.data
        let imgUrl = mainData.url
        let imgStr
        let crosspostKey = mainData.crosspost_parent_list

        if(crosspostKey !== undefined) {
            mainData = crosspostKey[0]
        }

        if(imgUrl == `https://www.reddit.com/gallery/${mainData.id}`) { 
            let galleryUrl = mainData.permalink.slice(0, -1)

            fetch(`https://www.reddit.com/${galleryUrl}.json`)
            .then(response => response.json())
            .then(object => {
                const path = object[0].data.children[0].data.media_metadata
                let imgStr = ''
                let firstImg
                let imgSliderCount = 0


                Object.entries(path).forEach(images => {
                    let imgSrc = `https://i.redd.it/${images[0]}.${images[1].m.slice(6)}`
                    if (imgSliderCount === 0) {
                        imgStr += `${imgSrc},`
                        firstImg = imgSrc
                    } else if(imgSliderCount === Object.entries(path).length - 1) {
                        imgStr += `${imgSrc}`
                    } else {
                        imgStr += `${imgSrc},`
                    }

                    imgSliderCount++
                })

                getPostsSection.innerHTML += `<div class="post" onclick="imagePreview('${firstImg}', '${imgStr}', this)"><div class="image-inner-section"><img loading="lazy" src="${firstImg}"></img></div><div class="text-inner-section"><h1><a href="https://www.reddit.com${mainData.permalink}" target="_blank">${mainData.title}</a></h1><p>Posted by <a href="https://www.reddit.com/u/${mainData.author}" target="_blank">u/${mainData.author}</a></p><h3 class="image-counter">1/${imgSliderCount}</h3></div></div>`
            })
        } else {
            let imgSrc = mainData.preview.images[0].resolutions

            if(i > lazyCount) {
                imgStr = `<img loading="lazy" src="${imgSrc[imgSrc.length - 1].url}"></img>`
            } else {
                imgStr = `<img src="${imgSrc[imgSrc.length - 1].url}"></img>`
            }

            getPostsSection.innerHTML += `<div class="post" onclick="imagePreview('${mainData.url}', null, this)"><div class="image-inner-section">${imgStr}</div><div class="text-inner-section"><h1><a href="https://www.reddit.com${mainData.permalink}" target="_blank">${mainData.title}</a></h1><p>Posted by <a href="https://www.reddit.com/u/${mainData.author}" target="_blank">u/${mainData.author}</a></p><h3 class="image-counter">1/1</h3></div></div>`
        }
        i++
    })

    if(after !== null) {
        let showMoreBtn = `<button id="show-more" onclick="fetchRSlashWallpaper('${apiLink}&after=${after}', true)">Show More</button>`
    
        let divNav = document.createElement("div")
        divNav.setAttribute("id", "btn-nav-section")
        document.body.appendChild(divNav)
        divNav.innerHTML += showMoreBtn
    }

}

function imagePreview(src, slideStr, elem) {
    let getImagePreview = document.getElementById(src)
    let getActiveImage = document.getElementById("active-img")

    if(elem === null) {
        getImagePreview.style.display = "none"
        document.body.style.overflow = "auto"
        getActiveImage.removeAttribute("id")
    } else if(elem != null) {
        if(getImagePreview !== null) {
            getImagePreview.style.display = "flex"
            document.body.style.overflow = "hidden"   
            getImagePreview.children[1].children[0].children[1].children[0].setAttribute("id", "active-img")
        } else if(getImagePreview === null) {
            if(slideStr === null) {
                elem.insertAdjacentHTML("afterend", `<div class="image-preview" id="${src}"><div class="text-inner-section"><div class="container"><div class="info"><h1>${elem.children[1].children[0].children[0].text}</h1><p>Posted by: ${elem.children[1].children[1].children[0].text}</p></div><i class="im im-x-mark" onclick="imagePreview('${src}', null, null)"></i></div></div><div class="image-inner-section"><img loading="lazy" src="${src}"></img></div></div>`)
            } else if(slideStr !== null) {
                let imgSliderCount = 0
                let imgStr = ``

                slideStr.split(",").forEach(imgSrc => {
                    if (imgSliderCount == 0) {
                        imgStr += `<img id="active-img" loading="lazy" src="${imgSrc}"></img>`
                    } else {
                        imgStr += `<img id="" loading="lazy" src="${imgSrc}"></img>`
                    }

                    imgSliderCount++
                })

                elem.insertAdjacentHTML("afterend", 
                `<div class="image-preview" id="${src}"><div class="text-inner-section"><div class="container"><div class="info"><h1>${elem.children[1].children[0].children[0].text}</h1><p>Posted by: ${elem.children[1].children[1].children[0].text}</p></div><i class="im im-x-mark" onclick="imagePreview('${src}', null, null)"></i></div></div><div class="image-inner-section"><div class="image-slider"><i class="fa-solid fa-angle-left" onclick="imageSlider(this, false)"></i><div class="img-container">${imgStr}</div><i class="fa-solid fa-angle-right" onclick="imageSlider(this, true)"></i></div></div></div>`)
            }
            document.body.style.overflow = "hidden"   
        }
    }
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

let status = true
function colorThemeSwitcher() {
    if(status) {
        document.documentElement.style.cssText = "--current-body-clr: var(--body-clr-l);--current-card-clr: var(--card-clr-l);--current-semi-clr: var(--semi-clr-l);--current-border-clr: var(--border-clr-l);--current-font-clr: var(--font-clr-d);";
        status = false
    } else if(!status) {
        document.documentElement.style.cssText = "--current-body-clr: var(--body-clr-d);--current-card-clr: var(--card-clr-d);--current-semi-clr: var(--semi-clr-d);--current-border-clr: var(--border-clr-d);--current-font-clr: var(--font-clr-l);";
        status = true
    }
}

//Imgur tests
// const test1 = fetch("https://imgur.com/a/vYvCqAf")
// const test2 = test1.json()
// console.log(test2)