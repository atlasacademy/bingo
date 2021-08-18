$('document').ready(async () => {
    for (let i = 2; i <= 7; i++) {
        $('#size').append(
            $('<option>')
                .prop('value', i)
                .text(`${i}x${i}`)
        );
    }

    const hash = window.location.hash,
        size = (hash.match(/^#([0-9]+)/) ?? [])[1],
        init = (hash.match(/\|[0-9,]*$/) ?? [])[0] ?? '',
        width = Math.max(Math.min($('body').width(), 600), 300),
        servants = [],
        selectedServants = [],
        getServant = (collectionNo) => {
            return servants
                .filter(servant => collectionNo == servant.collectionNo)
                .shift();
        },
        getSquare = (position) => {
            const x = position % size,
                y = Math.floor(position / size);

            return $('#bingo')
                .children().eq(y)
                .children().eq(x);
        },
        loadServants = () => {
            return new Promise(resolve => {
                $.ajax({
                    url: 'https://api.atlasacademy.io/export/JP/basic_servant_lang_en.json',
                    success: (data) => {
                        servants.push(...data);

                        $('#servant').append(
                            data.map(servant => (
                                $('<option>')
                                    .prop('value', servant.collectionNo)
                                    .text(`${servant.name} (${servant.className})`)
                            ))
                        );

                        resolve();
                    }
                });
            })
        },
        render = () => {
            $('#bingo').width(width);
            $('#size').val(size);

            for (let y = 0; y < size; y++) {
                let row = $('<div>').addClass('row');

                for (let x = 0; x < size; x++) {
                    $('#position').append(
                        $('<option>')
                            .prop('value', y * size + x)
                            .text(`${y + 1} x ${x + 1}`)
                    );

                    row.append(
                        $('<div>')
                            .addClass('square')
                            .css('padding-top', `calc(100% / ${size})`)
                    );
                }

                $('#bingo').append(row);
            }

        },
        setSquare = function (position, collectionNo) {
            const square = getSquare(position),
                servant = getServant(collectionNo);

            square.html(
                $('<img/>')
                    .prop('src', servant.face)
                    .prop('alt', servant.name)
            );

            selectedServants[position] = collectionNo;
            window.location =
                window.location.href.split('#')[0]
                + '#' + size
                + '|' + selectedServants.join(',');
        };

    if (size) {
        render();
        for (let i = 0; i < size; i++) {
            selectedServants.push(undefined);
        }
        await loadServants();
        init.slice(1)
            .split(',')
            .forEach((collectionNo, i) => {
                if (!collectionNo)
                    return;

                setSquare(i, collectionNo);
            });
    }

    $('#size').change(function () {
        const size = $(this).val();

        window.location = window.location.href.split('#')[0] + '#' + size;
        window.location.reload();
    });

    $('#servant').change(function () {
        const position = $('#position').val(),
            svt = $('#servant').val();

        if (!svt)
            return;

        setSquare(position, svt);

        $('#servant').val('');
    });

});
