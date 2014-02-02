describe('s2js player:', function () {

    var getPlayer = function (type, container, options) {
        var html5;

        if (!type) {
            type = 'Youtube';
        }
        if (!container) {
            container = $(document.documentElement);
        }
        if (!options) {
            options = {
                videoId: 'M7lc1UVf-VE',
                sources: ['video.mp4']
            };
        }

        player = new s2js.Video(type, container, options);

        return player;
    };

    it('build', function () {
        var player = getPlayer();
    });
});
