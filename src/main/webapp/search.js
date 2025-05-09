/**
 * Handles all actions on the main screen
 */

var token = ""
fetch("/artistproject/authtoken")
			.then(response => response.json())
			.then(data => {
				token = data["token"];
						
			})
			.catch(error => {
				console.error("Error:", error);
			});
			
var pageSize = 10

var artistLinks = [];
var selectedCard = null;

document.addEventListener('DOMContentLoaded', function() {
	const searchBar = document.getElementById('search-bar');
	const cards = document.getElementsByClassName("artist-card");
	
	// Search Bar submit listener
	searchBar.addEventListener('submit', function(event) {	
		event.preventDefault();
		console.log("Searching for results...");
		
		// Reset search screen
		document.getElementById("no-results").style.display = "none";
		for (let i = 0; i < cards.length; i++) {
			cards[i].style.display = "none";
		}
		if (selectedCard) {
			selectedCard.classList.remove('artist-selected');
			selectedCard = null;
		}
		document.getElementById("profile").style.display = "none";
		
		document.getElementById("loading-gif").style.display = "block";
		
		// Collect Search params
		const searchData = new FormData(searchBar);
		searchData.set("size", pageSize);
		searchData.set("type", "artist");
		const query = searchData.get("q");
		console.log("Search query: " + query);
		const params = new URLSearchParams(searchData);
		
		// Artsy Search HTTP request
		fetch("https://api.artsy.net/api/search?" + params.toString(), {
			method: 'GET',
			headers: {
				'X-XAPP-Token': token
			}})
			.then(response => response.json())
			.then(data => {
				document.getElementById("loading-gif").style.display = "none";
				
				const results = data["_embedded"]["results"];
				console.log("Results:")
				console.log(results);
				artistLinks.length = 0;
				
				// Display error message if no results
				if (results.length == 0) {
					document.getElementById("no-results").style.display = "block";
				}
				
				// Display results as artist cards
				for (let i = 1; i <= results.length; i++) {
					const result = results[i - 1];
					artistLinks.push(result["_links"]["self"]["href"]);
					document.getElementById("artist-card-" + i).style.display = "block";
					var imgsrc = result["_links"]["thumbnail"]["href"];
					if (imgsrc == "/assets/shared/missing_image.png") {
						imgsrc = "assets/images/artsy_logo.svg";
					}
					document.getElementById("artist-image-" + i).src = imgsrc;
					document.getElementById("artist-name-" + i).innerHTML = result["title"];
				}
				
			})
			.catch(error => {
				console.error("Error:", error);
			});
			
		
	});
	
	// Card selection listeners
	for (let i = 0; i < cards.length; i++) {
		cards[i].addEventListener("click", function() {
			
			// Highlight most recently selected card
			if (selectedCard) {
				selectedCard.classList.remove('artist-selected');
			}
			let card = cards[i];
			card.classList.add('artist-selected');
			selectedCard = card;
			
			
			// Artsy Artists HTTP request
			fetch(artistLinks[i], {
				method: 'GET',
				headers: {
					'X-XAPP-Token': token
				}})
				.then(response => response.json())
				.then(data => {
					console.log("Artist data:");
					console.log(data);
					
					document.getElementById("name").innerHTML = data["name"];
					document.getElementById("years").innerHTML = "(" + data["birthday"] + " - " + data["deathday"] + ")";
					document.getElementById("nationality").innerHTML = data["nationality"];
					document.getElementById("bio").innerHTML = data["biography"];
				})
				.catch(error => {
					console.error("Error:", error);
				});
			
			
			// Make profile visible
			document.getElementById("profile").style.display = "flex";
			
		});
	}
	
	// Register listener
	const registerForm = document.getElementById('register');
	const fullnameInput = document.getElementById('fullname');
	const emailInput = document.getElementById('email');
	const passwordInput = document.getElementById('password');
	const registerButton = document.getElementById('register-button');
	
	registerForm.addEventListener('input', function() {
		
		console.log("Input deteced");
		var isValid = true;
		
		if (fullnameInput.checkValidity()) {
			document.getElementById("fullname-warning").style.display = "none";
		} else {
			isValid = false;
			document.getElementById("fullname-warning").style.display = "block";
		}
		
		if (emailInput.checkValidity()) {
			document.getElementById("email-warning").style.display = "none";
		} else {
			isValid = false;
			document.getElementById("email-warning").style.display = "block";
		}

		if (passwordInput.checkValidity()) {
			document.getElementById("password-warning").style.display = "none";
		} else {
			isValid = false;
			document.getElementById("password-warning").style.display = "block";
		}
		
		if (isValid) {
			registerButton.disabled = false;
		} else {
			registerButton.disabled = true;
		}
		
	});
	
});
