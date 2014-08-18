describe('HTML5Video:', function () {
    var getPlayer = function (container, options) {
        var html5;

        if (!container) {
            container = $('<div />', {'class': 'video-container'}).appendTo(document.body);
        }
        if (!options) {
            options = {
                sources: ['video.mp4']
            };
        }

        player = new s2js.Video('HTML5', container, options);
        player.media = jasmine.createSpyObj('video', ['play', 'pause']);

        return player;
    };

    it('build', function () {
        var player = getPlayer(),
            video = $(player.element);

        expect(video.length).toEqual(1);
        expect(video.find('source').get(0).type).toBe('video/mp4');
    });

    it('play', function () {
        var player = getPlayer();

        player.play();
        expect(player.paused).toBeFalsy();
        expect(player.media.play).toHaveBeenCalled();
    });

    it('pause', function () {
        var player = getPlayer();

        player.pause();
        expect(player.paused).toBeTruthy();
        expect(player.media.pause).toHaveBeenCalled();
    });


    it('mute', function () {
        var player = getPlayer();

        player.mute();
        expect(player.muted).toBeTruthy();
        expect(player.media.muted).toBeTruthy();
    });

    it('unMute', function () {
        var player = getPlayer();

        player.mute();
        player.unMute();
        expect(player.muted).toBeFalsy();
        expect(player.media.muted).toBeFalsy();
    });

    it('setCurrentTime', function () {
        var player = getPlayer();

        player.setCurrentTime(10);
        expect(player.currentTime).toBe(10);
        expect(player.media.currentTime).toBe(10);
    });

    it('setVolume', function () {
        var player = getPlayer();

        player.setVolume(0.1);
        expect(player.volume).toBe(0.1);
        expect(player.media.volume).toBe(0.1);
    });

    it('setPlaybackRate', function () {
        var player = getPlayer();

        player.setPlaybackRate(2.0);
        expect(player.playbackRate).toBe(2.0);
        expect(player.media.playbackRate).toBe(2.0);
    });

    it('getAvailablePlaybackRates', function () {
        var player = getPlayer(),
            rates = player.getAvailablePlaybackRates(),
            expected = [0.5, 1.0, 1.5, 2.0];

        expect(rates).toEqual(expected);
    });

    it('getPlayerState', function () {
        var player = getPlayer(),
            state = player.getPlayerState(),
            expected = -1;

        expect(state).toEqual(expected);
    });

    describe('getVideoType', function () {
        it('supported file type', function () {
            var player = getPlayer(null, {
                    sources: ['http://www.example.org/video.webm?param1=val']
                }),
                type = player.getVideoType('http://www.example.org/video.webm?param1=val'),
                expected = 'video/webm';

            expect(type).toEqual(expected);
            expect($(player.element).find('source').length).toBe(1);
        });
        it('unsupported file type', function () {
            var player = getPlayer(null, {
                    sources: ['http://www.example.org/video.mp3']
                }),
                type = player.getVideoType('http://www.example.org/video.mp3'),
                expected = null;

            expect(type).toEqual(expected);
            expect($(player.element).find('source').length).toBe(0);
        });
    });


    describe('initialize', function () {
        it('properties', function () {
            var options = {
                    volume: 0.5,
                    playbackRate: 1.0,
                    autoplay: true,
                    controls: true,
                    loop: true,
                    muted: true,
                    sources: ['video.mp4']
                },
                player = getPlayer(null, options);

            $.each(options, function(option, value) {
                if (option === 'sources') return;

                expect(player[option]).toBe(value);
            });
            expect(player.options['sources']).toEqual(options['sources']);
        });
    });
});
