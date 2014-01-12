describe('HTML5Video:', function () {
    beforeEach(function () {
        this.player = new HTML5Wrapper($(document.documentElement), {});
    });
    afterEach(function () {
        this.player.destroy();
    });
    it('build', function () {
        expect($('video').length).toEqual(1);
    });
    it('play', function () {
        // var video = document.getElementsByTagName('video')[0];
        // spyOn(video, 'play');
        // expect(video.play).toHaveBeenCalled();
    });
    describe('Test parameters', function () {
        it('volume', function () {
            expect(this.player.volume).toBe(1);
        });
    });
});
