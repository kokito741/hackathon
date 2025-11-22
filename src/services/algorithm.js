function algorithmScore(chat) {
    let score = 0;

    if (/kill|hurt/i.test(chat)) score += 3;
    if (/control|money|cant leave/i.test(chat)) score += 2;
    if (/scared|fear/i.test(chat)) score += 1;

    let level = "low";
    if (score >= 3) level = "medium";
    if (score >= 5) level = "high";
    if (score >= 7) level = "critical";

    return { score, level };
}

module.exports = { algorithmScore };
