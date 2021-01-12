//Clear the measure box, then update it with current (monthly) counterMeasures

function loadMeasures(counterM) {
	const monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	document.getElementById("measure-div").innerHTML = "";

	for (let i = 0; i < counterM.length; i++) {
		document.getElementById("measure-div").innerHTML += "<h3>" + counterM[i].date.getDate() + ". " + monthNames[counterM[i].date.getMonth()] + " " + counterM[i].date.getFullYear() + "</h3><p>" + counterM[i].shorttext + " <a href=\"" + counterM[i].link + "\" target=\"_blank\">(mehr Anzeigen)</a>";
	}
}