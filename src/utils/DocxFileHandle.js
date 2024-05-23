mammoth.embedStyleMap({path: "123.docx"})
    .then(function(result){
        var html = result.value; // The generated HTML
        var messages = result.messages; // Any messages, such as warnings during conversion
        console.log(html)
    })
    .catch(function(error) {
        console.error(error);
    });