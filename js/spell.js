var MAX_SPELL_LENGTH = 10;

var spellList = [
  {gesture: "BABDZ", name: "FIREBALL", niceName: "Fireball"},
  {gesture: "EBCY", name: "COUNTERSPELL", niceName: "Counterspell"},
  {gesture: "DAY", name: "SHIELD", niceName: "Shield"},
  {gesture: "BX", name: "SHIELDBREAKER", niceName: "Shield Breaker"},
  {gesture: "DABCX", name: "GREATERSHIELD", niceName: "Greater Shield"},
  {gesture: "CDEX", name: "HEAL", niceName: "Heal"},
  {gesture: "BZ", name: "MAGICMISSILE", niceName: "Magic Missile"},
  {gesture: "DCY", name: "DODGE", niceName: "Dodge"},
  {gesture: "BCAY", name: "SILENCE", niceName: "Silence"},
  {gesture: "BCZ", name: "POISON", niceName: "Poison"},
  {gesture: "AEX", name: "DYNAMITE", niceName: "Dynamite"},
  {gesture: "BABDBAY", name: "PYROBLAST", niceName: "Pyroblast"},
  {gesture: "CBEX", name: "VAMPIRICBLAST", niceName: "Vampiric Blast"},
  {gesture: "DX", name: "AUGMENT", niceName: "Augment"},
  {gesture: "DECAY", name: "MIRROR", niceName: "Mirror"},
  {gesture: "EBEZ", name: "EXODIA", niceName: "Exodia"}
];

var gestureLetterMap = {
	"A": "THUMB",
	"B": "FLIP",
	"C": "PRESS",
	"D": "STOP",
	"E": "SPOCK",
	"X": "FIST",
	"Y": "POINT",
	"Z": "DOUBLE"
};

function spellCheck(gestures) {
	var moveMap = {
		"NONE": "0",
		"THUMB": "A",
		"FLIP": "B",
		"PRESS": "C",
		"STOP": "D",
		"SPOCK": "E",
		"FIST": "X",
		"POINT": "Y",
		"DOUBLE": "Z"
	};

	//Variable for storing the spell in letter mode
	var cast = "";

	for (var i = 0; i < gestures.length; i++) {
		cast += moveMap[gestures[i]];
	}

	//This is really sketchy and looks pretty ugly, fhasdjfhjkasdhflhjqfsdjahfaks
	if (cast[cast.length - 1] != "X" && cast[cast.length - 1] != "Y" && cast[cast.length - 1] != "Z") {
		return "NONE";
	}

	var substring;
	for (var k = cast.length - 2; k >= 0; k--) {
		substring = cast.substring(k, cast.length);
		for (var l = 0; l < spellList.length; l++) {
			if (spellList[l].gesture === substring) return spellList[l].name;
		}
	}
	return "NONE";
}

function spellLength(spellName) {
	for (var l = 0; l < spellList.length; l++) {
		if (spellList[l].name === spellName) return spellList[l].gesture.length;
	}

	return -1;
}
