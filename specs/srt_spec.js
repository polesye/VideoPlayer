describe('SubRip', function () {
    var SRT = ['0\n',
        '00:00:00,000 --> 00:00:07,870\n',
        '[MUSIC PLAYING]\n',
        '\n',
        '1\n',
        '00:00:07,870 --> 00:00:09,950\n',
        'DR. ARIEL FENSTER: OK, we are back talking about food.\n',
        '\n',
        '2\n',
        '00:00:09,950 --> 00:00:13,360\n',
        'And I always love to talk about food because, after all, I\n',
        '\n',
        '3\n',
        '00:00:13,360 --> 00:00:14,890\n',
        'do come from France.\n',
        '\n',
        '4\n',
        '00:00:14,890 --> 00:00:17,980\n',
        'And it is well known that we French people care only about two things in\n',
        '\n',
        '5\n',
        '00:00:17,980 --> 00:00:20,710\n',
        'life, and one of them is food.\n',
        '\n',
        '\n'].join('');

    beforeEach(function () {
        this.subrip = new SubRip(SRT);
    });

    it('can search correctly', function () {
        expect(this.subrip.getTextBySeconds(15).text).toBe('\nAnd it is well known that we French people care only about two things in');
    });
});
