"use strict";
var arrSize=0;
var tileLimit=0;
var pointer=0;
var tileElements=[];
var filterElements=[];
var forward=true;
var searchOn=false;

if(typeof pok_config != "undefined" && pok_config && pok_config.maxcount){
	arrSize=Number(pok_config.maxcount);
}

if(typeof pok_config != "undefined"  && pok_config && pok_config.maxtiles){
	tileLimit=Number(pok_config.maxtiles);
}

if(typeof arrSize != "undefined"  && arrSize && !Number.isNaN(arrSize)){
	console.log("Max Array Size set to : "+arrSize);
}else{
	arrSize=151;
	console.log("Max Array Size set to default value : "+arrSize);
}

if(typeof tileLimit != "undefined"  && tileLimit && !Number.isNaN(tileLimit)){
	console.log("Tiles per page set to : "+tileLimit);
}else{
	tileLimit=20;
	console.log("Tiles per page set to default value : "+tileLimit);
}

function setMessage(text){
	$("#status-bar").html("<p>"+text+"</p>");
}

function getPokemonDetails(callback) {
        var getAPIURL = "https://pokeapi.co/api/v2/pokemon?limit="+arrSize;
        $.ajax({
            url: getAPIURL,
            contentType: "application/json",

            type: 'POST',
            dataType: 'json',
            success: function(data, textStatus, xhr) {
                var httpStatus = xhr.status
                if (callback) {
                    callback(data, textStatus, httpStatus);                    
                }
            },

            error: function(data, textStatus, xhr) {
                var httpStatus = xhr.status;
                console.log("API Call returned error message! Cannot proceed further.");
            }
        });

    }

function getPokeNumber(jsonObj){
	var url=jsonObj.url;
	url=url.replace('\\').split('/');
	var pokeNumber=Number(url[url.length-2]);
	return pokeNumber;	
}

function createPokeTiles(resultsArr){
	var gallery=$('#pokemon-gallery');
	tileElements=new Array(resultsArr.length);
	for(var count=0;count<tileElements.length;count++){

		var name=resultsArr[count].name;
		var pokeno=getPokeNumber(resultsArr[count]);		

		tileElements[count]=document.createElement("div");
		tileElements[count].setAttribute("class","poke-tile col-sm-8 col-md-6 col-xl-3");
		tileElements[count].setAttribute("id",name);
		
		var imgElement=document.createElement("img");
		var image="images/"+pokeno+"-"+name+"-icon.png";		
		imgElement.setAttribute("src",image);

		var headingElement=document.createElement("p");
		headingElement.setAttribute("class","tileheading");
		$(headingElement).html("NO : "+pokeno+" <br> "+name.toUpperCase());

		$(tileElements[count]).append(headingElement);
		$(tileElements[count]).append(imgElement);
		$(tileElements[count]).hide();
		$(gallery).append(tileElements[count]);
	}
}

function hideAllTiles(){
	$(".poke-tile").hide();
}

function showTilesPerPage(elArray,maxSize){
	var start=pointer;
	if(forward){
		start=pointer;
		pointer=(pointer+tileLimit) > maxSize ? maxSize: (pointer+tileLimit);
	}else{
		start=pointer+tileLimit;
		pointer=pointer+tileLimit+tileLimit;
	}
	
	for(var count=start;count< pointer; count++){
		$(elArray[count]).show();
	}
	if(pointer == maxSize){
		pointer=start; 
		$(".next").addClass("disabled");
		forward=false;
	}else{
		forward=true;
	}

	if(pointer > tileLimit){
		$(".prev").removeClass("disabled");
	}
}

function backTilesPerPage(elArray,maxSize){
	var end=pointer;

	if(forward){
	  end=pointer-tileLimit;	
	  pointer=pointer-tileLimit-tileLimit;
	  //don't change the lines
	}else{
		end=pointer;
		pointer= (pointer-tileLimit) < 0 ? 0 : (pointer-tileLimit);
	}	

	for(var count=pointer;count< end; count++){
		$(elArray[count]).show();
	}

	if(pointer == 0){
		pointer=end;
		$(".prev").addClass("disabled");
		forward=true;
	}else{
		forward=false;
	}
	if(pointer < maxSize){
		$(".next").removeClass("disabled");
	}
}

$(".next").click(function(){
	if($(".next").hasClass("disabled"))return;
	hideAllTiles();
	if(searchOn){
		showTilesPerPage(filterElements,filterElements.length);
	}
	else{
		showTilesPerPage(tileElements,arrSize);
	}
	
});

$(".prev").click(function(){
	if($(".prev").hasClass("disabled"))return;
	hideAllTiles();
	if(searchOn){
		backTilesPerPage(filterElements,filterElements.length);
	}
	else{
		backTilesPerPage(tileElements,arrSize);
	}
});

function tileData(resultsArr){
 	if(resultsArr && Array.isArray(resultsArr)){
	   	if(resultsArr.length > 0){
	   		if(resultsArr.length > arrSize){
	   			resultsArr.length=arrSize; //Picking till the maxlimit.
	   		}else if(resultsArr.length < arrSize){
	   			arrSize=resultsArr.length;
	   			console.log("Max Array Size reduced to the number of results returned : "+arrSize);
	   		}

	   		createPokeTiles(resultsArr);
	   		
	   		showTilesPerPage(tileElements,arrSize);

	   		setMessage("");
	   		if(pointer+tileLimit < arrSize){$(".next").removeClass("disabled");}
		 	
	 	}else{
	 		console.log("API call is success. but zero results found. Cannot proceed further.");
	 		setMessage("Zero pokemons found. Try again later.");
	 	}
	 } else{
	   	console.log("API call is success. but no results found. Cannot proceed further.");
	   	setMessage("Zero pokemons found. Try again later.");
	   	return;
	 }

 }
	
if(window.jQuery){
	setMessage("Loading....");
	$(".next").addClass("disabled");
	$(".prev").addClass("disabled");

	getPokemonDetails(function(response, textStatus, httpStatus){
			if (httpStatus && httpStatus == '200') {
                if (response) {
                	tileData(response.results);
                }
            } else if (httpStatus && httpStatus == '400') {
            	console.log("API Call failed! Cannot proceed further.");
            	setMessage("Zero pokemons found. Try again later.");
            }
        
	});
}else{
    console.log("jQuery not available or supported. Cannot proceed further.");
}



$("#poke-search").click(function(){
	var searchText=$("#searchPattern").val();

	if(!searchText.trim().match(/^[a-zA-Z-]+$/gi)){
		 setMessage("Use only alphabets and hyphen (-) to search pokemons.");
		 return;
	}

	if(searchText && searchText.trim().length > 0){
		searchOn=true;
	   searchText=searchText.toLowerCase()
	   filterElements=$(".poke-tile[id*="+searchText+"]");
	   hideAllTiles();
	   pointer=0;
	   if(filterElements.length <= tileLimit){
	   	 $(filterElements).show();
	   	 $(".prev").addClass("disabled");
	   	 $(".next").addClass("disabled");
	   }else{
	   	 $(".prev").addClass("disabled");
	     showTilesPerPage(filterElements,filterElements.length);
	     $(".next").removeClass("disabled");
	   }
	   setMessage(filterElements.length+" results found.");

	}
});

$("#clear-search").click(function(){
	if(searchOn){
		$("#searchPattern").val("");
		setMessage("Search cleared. Showing all pokemons.");
		searchOn=false;
		pointer=0;
		forward=true;
		hideAllTiles();
		$(".prev").addClass("disabled");
		$(".next").removeClass("disabled");
		showTilesPerPage(tileElements,arrSize);
	}else{
		setMessage("No search performed.");
	}
});