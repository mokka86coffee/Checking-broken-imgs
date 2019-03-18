{ 
    const axios = require('axios');
    const fs = require('fs');

    let checkForBrokenImgs = async (links, page) => {
        for (let link of links) {
            try {
                await axios.get(link); 
            } catch (err) {
                console.log('https://stanok74.ru/' + page);
            }
        }

    }

    let getImgsLinksFromPage = async (pageUrl) => {

        const urlmain = 'https://stanok74.ru/';

        const response = await axios.get(urlmain+pageUrl);
        let strings = response.data.split('\n');

        return strings
            .filter(str => ~str.indexOf('img') && !~str.indexOf('script') && !~str.indexOf('eshop-item-small__img'))
            .map( str => str.match(/_mod_files.+?(jp(e)?g|png|webp)+?/g) )
            .filter( str => str && !(/yandex/gi).test(str[0]) && !(/amiro/).test(str[0]) )
            .map( str => urlmain + str[0] )
            .filter( (str,idx,arr) => arr.indexOf(str) === idx );
    }

    
    let getProductsLinksFromCatalog = async (pageUrl, partUrl) => {
        try {
            const response = await axios.get(pageUrl);
            let strings = response.data.split('\n');
    
            strings = strings
                .filter( str => ~str.indexOf(partUrl) && ~str.indexOf('href') && !~str.indexOf('offset') && ( new RegExp(partUrl + '\/.+', 'g') ).test(str) );
            
            if (!strings.length) { throw new Error('no more items left') };
            
            strings = strings
                .map( str => str.match(/katalog\/internet-magazin\/.+?("|')+?/g)[0].slice(0,-1) )
                // .filter( str => str && !(/yandex/gi).test(str[0]) && !(/amiro/).test(str[0]) )
                // .map( str => urlmain + str[0] );
    
            return strings.filter( (str, idx) => idx == strings.indexOf(str) );
        } catch (err) {
            if (err.message === 'no more items left') { throw new Error('no more items left'); }
            else { console.log(err.message) }
           
        }
    }
    
    (async()=>{

    const urlMain = 'https://stanok74.ru/katalog/internet-magazin/dlja-listovogo-metalla/listogibochnye-valcy/3-h-valkovye-ruchnye';
    urlPart = '3-h-valkovye-ruchnye';

    console.log('started - ', urlPart);
    console.log('--------------');
    console.log('');
    
    let error = 0;
    for (let i=0; i< 1180; i+=12) {
        const url = !i
            ? urlMain
            : `${urlMain}?action=rsrtme&catid=20107&offset=${i}`;


        try {
            let pagesUrls = await getProductsLinksFromCatalog(url, urlPart);
    
            for (page of pagesUrls) {
                let ImgsFromPageArr = await getImgsLinksFromPage(page);
                // console.log('got imgs urls from page - ', ImgsFromPageArr.length);
                await checkForBrokenImgs(ImgsFromPageArr, page);
            }


        } catch (err) {
            error++;
            if ( err.message === 'no more items left' ) { break; }
            else { console.log(err.message) }
        }


    }

    if (!error) { console.log('All images are ok') }
    console.log('');
    console.log('--------------');
    console.log('done');

  })()
}
