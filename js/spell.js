var MAX_SPELL_LENGTH = 10;

var spellMap =  {
	gestures: ["BABDZ", "EBCY", "DAY", "BX", "DABCX", "CDEX", "BZ", "DCY", "BCAY", "BCZ", "AEX", "BABDBAY", "CBEX", "DX", "DECAY", "EBEZ"],
	spellName: ["FIREBALL", "COUNTERSPELL", "SHIELD", "SHIELDBREAKER", "GREATERSHIELD", "HEAL", "MAGICMISSILE", "DODGE", "SILENCE", "POISON", "DYNAMITE", "PYROBLAST", "VAMPIRICBLAST", "AUGMENT", "MIRROR", "EXODIA"]
}

function spellCheck(gestures) {
	var moveMap = {
		names: ["NONE", "THUMB", "FLIP", "PRESS", "STOP", "SPOCK", "FIST", "POINT", "DOUBLE"],
		letters: ["0", "A", "B", "C", "D", "E", "X", "Y", "Z"]
	}

	//Variable for storing the spell in letter mode
	var cast = "";

	for (var i = 0; i < gestures.length; i++) {
		for (var j = 0; j < moveMap.names.length; j++) {
			if (gestures[i] === moveMap.names[j]) cast += moveMap.letters[j];
		}
	}

	//This is really sketchy and looks pretty ugly, fhasdjfhjkasdhflhjqfsdjahfaks
	if (cast[cast.length - 1] != "X" && cast[cast.length - 1] != "Y" && cast[cast.length - 1] != "Z") {
		return "NONE";
	}

	var substring;
	for (var k = cast.length - 2; k >= 0; k--) {
		substring = cast.substring(k, cast.length);
		for (var l = 0; l < spellMap.gestures.length; l++) {
			if (spellMap.gestures[l] === substring) return spellMap.spellName[l];
		}
	}
	return "NONE";
}

function spellLength(spellName) {
	for (var l = 0; l < spellMap.gestures.length; l++) {
		if (spellMap.spellName[l] === spellName) return spellMap.gestures[l].length;
	}

	return -1;
}
