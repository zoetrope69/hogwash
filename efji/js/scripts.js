(function(){ main(); })() // On load

	
function main(){
	var itemAmount = 15; // amount of items on grid on one axis
	var tryCount = 30; // amount of tries you get

	var colourSeed = Math.floor(Math.random()*360); // random colour seed

	var size = 300;

	$('canvas').attr('Height', size);
	$('canvas').attr('Width', size);
	$('main').width(size + 6);

	game(true, colourSeed, itemAmount, tryCount);
}

function game(intial, colourSeed, itemAmount, tryCount){
	var canvas = document.getElementById('canvas');

	// if the browser supports canvas
	if(canvas.getContext){

		// store this for later
		var intialTryCount = tryCount;

		var ctx = canvas.getContext('2d');
		var canvasSize = canvas.width;

		// clear the canvas
		ctx.clearRect(0, 0, canvasSize, canvasSize);

		// how big should each item be
		var itemSize = canvasSize / itemAmount;
		
		// amount of colours to generate from the seed
		var colourAmount = 6;

		// generate the colours to be used
		colours = genColours(colourSeed, colourAmount);

		genButtons(colours);
		// make the buttons all equal width
		var buttonSize = (100 / colours.length * 2)+'%';
		$('.input-button').css('width', buttonSize);
		$('.input-button').css('height', $('.input-button').css('width'));

		$('.win-lose').find('button').height($('.controls').height());

		var items = genItems(ctx, itemAmount, colours);

		// intialisation
		items[0]['active'] = true;

		// if its the intial game then set a standard pattern
		if(intial){
			items[0]['colourId'] = 0; items[1]['colourId'] = 1;
			items[2]['colourId'] = 2; items[3]['colourId'] = 3;
		}

		var intialColour = items[0]['colourId'];
		// affect the items and decide which items are active
		items = affectItems(items, itemAmount, intialColour, canvasSize);

		drawGrid(ctx, items, itemSize, colours);	

		$('.counter').html(tryCount + ' tries left!');

		// clicky input buttons
		$('.input-button').unbind().on('click', function(){
			var colourId = $(this).val();
			inputHandler(colourId);
		});

		// keyboard input
		$(document).unbind().keyup(function(e){
			var key = e.which; // which key was pressed
			var keys = getKeys();
			var colourId = keys.indexOf(key); // is that one of our keys

			if(colourId != -1){ // if its not a key
				if(!$('.win-lose').is(':visible')){
					inputHandler(colourId);
				}
			}else if(key == 13 || key == 32){ // if its enter or space
				winLoseHandler();
			}

			e.preventDefault();
			return false;
		});

		$('.win-lose button').unbind().on('click', function(){
			winLoseHandler();
		});

		// handles the inputs into the game
		function inputHandler(colourId){
			
			items = affectItems(items, itemAmount, colourId, canvasSize);
			drawGrid(ctx, items, itemSize, colours);

			tryCount--;
			if(tryCount < 0){ tryCount = 0; }
			$('.counter').html(tryCount + ' tries left!');

			var win = checkWin(items);
			var lose = (tryCount <= 0);

			if(win || lose){
				$('.win-lose').addClass('win-lose-visible');				
				$('.counter').html(tryCount + ' tries left!');				
			}

			// reset
			$('.win-lose button').removeClass();
			$('.win-lose p').html('');

			if(win){
				$('.win-lose h2').html('You win.');
				tryString = 'tries';
				if(tryCount == 1){ tryString = 'try'; }
				$('.win-lose p').html('You had '+tryCount+' '+tryString+' left!');
				$('.win-lose button').addClass('win-button').html('Continue <span>[space]</span>');
			}
			else if(lose){
				$('.win-lose h2').html('You lost.');
				$('.win-lose button').addClass('lose-button').html('Try again <span>[space]</span>');
			}

		}

		// progression or refresh of a game
		function winLoseHandler(){
			if($('.win-lose button').hasClass('win-button')){
				tryCount = intialTryCount + 1;
				game(false, colourSeed, itemAmount, tryCount);
			}else if($('.win-lose button').hasClass('lose-button')){
				game(false, colourSeed, itemAmount, intialTryCount);
			}

			$('.win-lose button').removeClass();
			$('.win-lose').removeClass('win-lose-visible');
		}

	}else{ // if the browser doesnt support canvas there should be an indication
		alert('Your browser doesn\'t support canvas. :(');
	}
}

// checks whether all squares a the same colour
function checkWin(items){
	var state = items[0]['colourId']; // the intial colour

	for(var i = 0; i < items.length; i++){
		// if any of the colours aren't the same as the intial return false (lose)
		if(state != items[i]['colourId']){ return false; }
	}
	// if all the colours are the same return true (win)
	return true;
}

// decides which squares are active
function affectItems(items, itemAmount, colourId, canvasSize){
	for(var i = 0; i < items.length; i++){
		// if the item is active then check the squares around it
		if(items[i]['active']){

			// resets
			var left = null; var top = null;
			var right = null;	var bottom = null;

			items[i]['colourId'] = colourId; // the original squares colour

			// for each direction around the square check whether we need to make it active
			// if statements are boundary checks

			if(items[i]['x'] > 0){
				var left = items[i-itemAmount];
				if(left['colourId'] == colourId){ left['active'] = true; }
			}

			if(items[i]['y'] > 0){
				var top = items[i-1];
				if(top['colourId'] == colourId){ top['active'] = true; }
			}

			if(items[i]['x'] < itemAmount-1){
				var right = items[i+itemAmount];
				if(right['colourId'] == colourId){ right['active'] = true; }
			}

			if(items[i]['y'] < itemAmount-1){
				var bottom = items[i+1];
				if(bottom['colourId'] == colourId){ bottom['active'] = true; }
			}

		}
	}

	return items;
}

// convert the buttons to their keycode equivalent
function getKeys(){
	var keys = [];
	$('.input-button').each(function(){
		var letter = $(this).html().toUpperCase();
		keys.push(letter.charCodeAt(0));
	});		
	return keys;
}

function genItems(context, itemAmount, colours){
	var items = [];
	var colourAmount = colours.length;

	for(var x = 0; x < itemAmount; x++){
		for(var y = 0; y < itemAmount; y++){
			// random colour
			var randId = Math.floor(Math.random() * colourAmount);
			var active = false;

			// each item is an object
			var item = new Object();
			item['x'] = x;
			item['y'] = y;
			item['colourId'] = randId;
			item['active'] = active;

			items.push(item);

		}
	}

	return items;
}

// draw the items to the canvas
function drawGrid(context, items, itemSize, colours){

	for(var i = 0; i < items.length; i++){
		var item = items[i];

		var x = item['x'];
		var y = item['y'];
		var colourId = item['colourId'];
		var active = item['active'];

		var colour = colours[colourId];

		drawSquare(context, itemSize, x * itemSize, y * itemSize, colour);

		// if the square is active then add a pattern to indicate so
		if(active){ drawPattern(context, itemSize, x * itemSize, y * itemSize); }

	}

	drawDitherResult(context, ditherFloydSteinberg);
	console.log('dither');
}

function drawPattern(context, size, originX, originY){
	context.fillStyle = 'rgba(255,255,255,0.1)'
	context.fillRect(originX + size / 4, originY + size / 4, size / 2, size / 2);

}

function drawSquare(context, size, originX, originY, colour){
	context.fillStyle = colour;
	context.fillRect(originX, originY, size, size);
}

function genButtons(colours){
	$('.buttons').html('');
	var buttonChars = 'wefjio';
	var startPos = Math.floor((buttonChars.length - colours.length) / 2);
	var colourCount = 0;
	for(var i = startPos; i < startPos + colours.length; i++){
		$('<button>').addClass('input-button').css('color', colours[colourCount])
					 .val(i).text(buttonChars.charAt(i)).appendTo('.buttons');
		colourCount++;
	}
}

function genColours(seed, amount){
	var colours = [];
	for(var i = 0; i < amount; i++){
		var h = (seed + (i * (360 / amount))) / 360;
		var s = 0.6; var l = 0.6;

		if(h > 360){ h = 360; }
		if(h < 0){ h = 0; }

		var rgb = hslToRgb(h, s, l);

		var r = Math.floor(rgb[0]);
		var g = Math.floor(rgb[1]);
		var b = Math.floor(rgb[2]);

		colours.push('rgb('+r+','+g+','+b+')')
	}
	return colours;
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

// dither stuff from https://github.com/mncaudill/3bitdither

function drawDitherResult(ctx, ditherer) {
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ditherer(imageData);
    ctx.putImageData(imageData, 0, 0);
}

function adjustPixelError(data, i, error, multiplier) {
    data[i] = data[i] + multiplier * error[0]; 
    data[i + 1] = data[i + 1] + multiplier * error[1]; 
    data[i + 2] = data[i + 2] + multiplier * error[2]; 
}

function dither8Bit(imageData) {
    var width = imageData.width,
        height = imageData.height,
        data = imageData.data;

    size = 4;
    for (y = 0; y < height; y += size) {
        for (x = 0; x < width; x += size) {

            sum_r = 0;
            sum_g = 0;
            sum_b = 0;

            for (s_y = 0; s_y < size; s_y++) {
                for (s_x = 0; s_x < size; s_x++) {
                    i = 4 * (width * (y + s_y) + (x + s_x));

                    sum_r += data[i];
                    sum_g += data[i + 1];
                    sum_b += data[i + 2];
                }
            }

            avg_r = (sum_r / (size * size)) > 127 ? 0xff : 00;
            avg_g = (sum_g / (size * size)) > 127 ? 0xff : 00;
            avg_b = (sum_b / (size * size)) > 127 ? 0xff : 00;

            for (s_y = 0; s_y < size; s_y++) {
                for (s_x = 0; s_x < size; s_x++) {
                    i = 4 * (width * (y + s_y) + (x + s_x));

                    data[i] = avg_r;
                    data[i + 1] = avg_g;
                    data[i + 2] = avg_b;
                }
            }
        }
    }
}

function ditherBayer(imageData) {
    var width = imageData.width,
        height = imageData.height,
        data = imageData.data;

    threshold_map = [
        [1, 9, 3, 11],
        [13, 5, 15, 7],
        [4, 12, 2, 10],
        [16, 8, 14, 6]
    ];

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            i = 4 * (y * width + x);

            gray = .3 * data[i] + .59 * data[i + 1] + .11 * data[i + 2];
            scaled = (gray * 17) / 255;
            val = scaled > threshold_map[x % 4][y % 4] ? 0xff : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
        }
    }
}

function ditherHalftone(imageData) {
    var width = imageData.width,
        height = imageData.height,
        data = imageData.data;

    for (var y = 0; y <= height - 2; y += 3) {
        for (var x = 0; x <= width - 2; x += 3) {

            sum_r = sum_g = sum_b = 0;
            indexed = [];
            count = 0;
            for (s_y = 0; s_y < 3; s_y++) {
                for (s_x = 0; s_x < 3; s_x++) {
                    i = 4 * (width * (y + s_y) + (x + s_x));
                    sum_r += data[i];
                    sum_g += data[i + 1];
                    sum_b += data[i + 2];

                    data[i] = data[i + 1] = data[i + 2] = 0xff;

                    indexed.push(i);
                    count++;
                }
            }

            avg_r = (sum_r / 9) > 127 ? 0xff : 00;
            avg_g = (sum_g / 9) > 127 ? 0xff : 00;
            avg_b = (sum_b / 9) > 127 ? 0xff : 00;

            avg_lum = (avg_r + avg_g + avg_b) / 3;
            scaled = Math.round((avg_lum * 9) / 255);

            if (scaled < 9) {
                data[indexed[4]] = avg_r;
                data[indexed[4] + 1] = avg_g;
                data[indexed[4] + 2] = avg_b;
            }

            if (scaled < 8) {
                data[indexed[5]] = avg_r;
                data[indexed[5] + 1] = avg_g;
                data[indexed[5] + 2] = avg_b;
            }

            if (scaled < 7) {
                data[indexed[1]] = avg_r;
                data[indexed[1] + 1] = avg_g;
                data[indexed[1] + 2] = avg_b;
            }

            if (scaled < 6) {
                data[indexed[6]] = avg_r;
                data[indexed[6] + 1] = avg_g;
                data[indexed[6] + 2] = avg_b;
            }

            if (scaled < 5) {
                data[indexed[3]] = avg_r;
                data[indexed[3] + 1] = avg_g;
                data[indexed[3] + 2] = avg_b;
            }

            if (scaled < 4) {
                data[indexed[8]] = avg_r;
                data[indexed[8] + 1] = avg_g;
                data[indexed[8] + 2] = avg_b;
            }

            if (scaled < 3) {
                data[indexed[2]] = avg_r;
                data[indexed[2] + 1] = avg_g;
                data[indexed[2] + 2] = avg_b;
            }

            if (scaled < 2) {
                data[indexed[0]] = avg_r;
                data[indexed[0] + 1] = avg_g;
                data[indexed[0] + 2] = avg_b;
            }
            
            if (scaled < 1) {
                data[indexed[7]] = avg_r;
                data[indexed[7] + 1] = avg_g;
                data[indexed[7] + 2] = avg_b;
            }
        }
    }
}

function ditherAtkinsons(imageData) {
    var width = imageData.width,
        height = imageData.height,
        data = imageData.data;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            i = 4 * (y * width + x);
            old_r = data[i]
            old_g = data[i + 1]
            old_b = data[i + 2];

            new_r = (old_r > 127) ? 0xff : 0;
            new_g = (old_g > 127) ? 0xff : 0;
            new_b = (old_b > 127) ? 0xff : 0;

            data[i] = new_r;
            data[i + 1] = new_g;
            data[i + 2] = new_b;

            err_r = old_r - new_r;
            err_g = old_g - new_g;
            err_b = old_b - new_b;

            // Redistribute the pixel's error like this:
            //       *  1/8 1/8
            //  1/8 1/8 1/8
            //      1/8 

            // The ones to the right...
            if (x < width - 1) {
                adj_i = i + 4;
                adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1/8);

                // The pixel that's down and to the right
                if (y < height - 1) {
                    adj_i = adj_i + (width * 4) + 4;
                    adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1/8);
                }

                // The pixel two over
                if (x < width - 2) {
                    adj_i = i + 8;
                    adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1/8);
                }
            }

            if (y < height - 1) {
                // The one right below
                adj_i = i + (width * 4);
                adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1/8);

                if (x > 0) {
                    // The one to the left
                    adj_i = adj_i - 4;
                    adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1/8);
                }

                if (y < height - 2) {
                    // The one two down
                    adj_i = i + (2 * width * 4);
                    adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1/8);
                }
            }
        }
    }
}

function ditherFloydSteinberg(imageData) {
    var width = imageData.width,
        height = imageData.height,
        data = imageData.data;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            i = 4 * (y * width + x);
            old_r = data[i]
            old_g = data[i + 1]
            old_b = data[i + 2];

            new_r = (old_r > 127) ? 0xff : 0;
            new_g = (old_g > 127) ? 0xff : 0;
            new_b = (old_b > 127) ? 0xff : 0;

            data[i] = new_r;
            data[i + 1] = new_g;
            data[i + 2] = new_b;

            err_r = old_r - new_r;
            err_g = old_g - new_g;
            err_b = old_b - new_b;

            // Redistribute the pixel's error like this:
            //   * 7
            // 3 5 1 

            // The ones to the right...
            if (x < width - 1) {
                right_i = i + 4;
                adjustPixelError(data, right_i, [err_r, err_g, err_b], 7/16);

                // The pixel that's down and to the right
                if (y < height - 1) {
                    next_right_i = right_i + (width * 4)
                    adjustPixelError(data, next_right_i, [err_r, err_g, err_b], 1/16);
                }
            }
            
            if (y < height - 1) {
                // The one right below
                down_i = i + (width * 4);
                adjustPixelError(data, down_i, [err_r, err_g, err_b], 5/16);

                if (x > 0) {
                    // The one down and to the left...
                    left_i = down_i - 4;
                    adjustPixelError(data, left_i, [err_r, err_g, err_b], 3/16);
                }
            }
        }
    }
}