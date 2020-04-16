const fs = require( 'fs' );

const htmlFilePath = process.argv[ 2 ];
const searchingData = '<p class="full_name">'

/* проверка - передан ли в скрипт файл .html  */
if ( ! htmlFilePath.endsWith( ".html" ) )
{
    console.error( "Входной файл не является файлом .html" );
    process.exit( 1 );
}
/* если да, то происходит парсинг html файла с целью поиска данных из тега searchingData */ 
parseFullName( htmlFilePath );

/* в парсинг имени входит две процедуры - 
* поиск (внутри промиса result)
* обработка (функция processParsedFullName) */
function parseFullName( filePath ) {

    let result = new Promise( ( resolve, reject ) => {

        fs.readFile( filePath, ( err, data ) =>{

            if ( err ) throw err;

            /* преобразование полученных с файла данных в строку */
            const fileAsStr = data.toString();

            /* поиск позиции с требуемым тегом */
            const nameTagPosition =  fileAsStr.indexOf( searchingData );
            /* если тег не найден */
            if ( nameTagPosition == -1 )
            {
                reject( `Входной файл .html не содержит тега <p> с единственным атрибутом class="full_name"` );
            }

            /* поиск закрывающего тега */
            const closingTagPosition = fileAsStr.indexOf( "</p>", 
            nameTagPosition + searchingData.length );
            if ( closingTagPosition == -1 )
            {
                reject( `Входной файл .html некорректен - отсутствует закрывающий тег для открывающего тега ${searchingData}` );
            }

            /* разрешение промиса с полученными данными внутри искомого тега - выделение подстроки */
            resolve( fileAsStr.substring( 
                nameTagPosition + searchingData.length, closingTagPosition )  );

        } );

    } )
    .then( function( value ) {

        /* если промис разрешился (то есть была найдена подстрока), 
        то происходит её обработка */
        processParsedFullName( value );

     }, ( reason ) => console.log( reason ) );
         
}

/* обработка строки с полным именем с целью вычленения ФИО */
function processParsedFullName( fullName )
{
    /* удаление пробелов в начале и конце строки */
    fullName = fullName.trim();

    /* замена множественных пробелов на один для корректного подсчета слова */
    fullName = fullName.replace( / +/g, " " );

    let amountWords = 0;

    /* разбиение строки на массив по пробелу => элемент массива - слово */
    let words = fullName.split( ' ' );

    /* проверка, содержала ли исходная строка что-либо кроме пробелов */
    fullNameWithoutSpaces = fullName.replace( " ", "" );
    if ( ! ( fullNameWithoutSpaces === "" ) ) {
        amountWords = words.length;
    }

    switch ( amountWords )
    {
        case ( 3 ):
        {
            console.log( `Ура! Мы нашли фамилию: ${words[0]}, имя: ${words[1]}, отчество: ${words[2]}!` );
            break;
        }
        case ( 2 ):
        {
            console.log( `Ура! Мы нашли фамилию: ${words[0]}, имя: ${words[1]}!` );
            break;
        }
        case ( 1 ):
        {
            console.log( `Ура! Мы нашли имя: ${words[0]}!` );
            break;
        }
        case ( 0 ):
        {
            console.log( 
                "Данные валидны, но содержат пустую строку или пробелы." );
                break;            
        }
        default:
        {
            console.log( "Данные валидны, но не обработаны - внутри тега находится 4 и более слов." );   
        }
    }
}

