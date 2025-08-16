import datetime

def CalculateCO2forDevice(devices):
    CO2Total = []
    for device in devices:
        created_at_list = device.get("created_at", [])

        if isinstance(created_at_list, list):
            for interval in created_at_list:
                if isinstance(interval, list) and len(interval) == 2:
                    start, end = interval

                    try:
                        # Convertir start a datetime aware en UTC
                        if start:
                            start_datetime = datetime.datetime.fromisoformat(str(start))
                            if start_datetime.tzinfo is None:
                                start_datetime = start_datetime.replace(tzinfo=datetime.timezone.utc)
                        else:
                            continue

                        # Convertir end o usar ahora (también aware en UTC)
                        if end:
                            end_datetime = datetime.datetime.fromisoformat(str(end))
                            if end_datetime.tzinfo is None:
                                end_datetime = end_datetime.replace(tzinfo=datetime.timezone.utc)
                        else:
                            end_datetime = datetime.datetime.now(datetime.timezone.utc)

                        # Calcular tiempo en horas
                        time_difference = end_datetime - start_datetime
                        hours = time_difference.total_seconds() / 3600

                        # Calcular CO2
                        watts = device.get("watts", 0)
                        CO2 = (watts * hours / 1000) * 0.44
                        CO2Total.append([round(CO2, 2),round(hours, 2)])
               

                    except Exception as e:
                        print(f"Error procesando intervalo {interval}: {e}")
    return CO2Total

devices = [
    {
        "_id": "689011a5893769dbef674264",
        "nombre": "sdf",
        "categoria": "electrodomesticos",
        "watts": 19,
        "color": "#c584ff",
        "imagen": "f2279c6a6804d930f3a9bbfd3fcac4cd.jpg",
        "state": True,
        "created_at": [
            ["2025-08-04T03:26:58.966882", None]
        ],
        "email": "crisesv4@gmail.com",
        "stringid": "2950cfad-8a6d-4906-a875-ff39c8a60698"
    },
     {
        "_id": "689011a5893769dbef674264",
        "nombre": "sdf",
        "categoria": "electrodomesticos",
        "watts": 28,
        "color": "#c584ff",
        "imagen": "f2279c6a6804d930f3a9bbfd3fcac4cd.jpg",
        "state": True,
        "created_at": [
            ["2025-08-04T02:26:57.966882", None]
        ],
        "email": "crisesv4@gmail.com",
        "stringid": "2950cfad-8a6d-4906-a875-ff39c8a60698"
    },
     {
        "_id": "689011a5893769dbef674264",
        "nombre": "sdf",
        "categoria": "electrodomesticos",
        "watts": 20,
        "color": "#c584ff",
        "imagen": "f2279c6a6804d930f3a9bbfd3fcac4cd.jpg",
        "state": True,
        "created_at": [
            ["2025-08-12T01:26:58.966882", None]
        ],
        "email": "crisesv4@gmail.com",
        "stringid": "2950cfad-8a6d-4906-a875-ff39c8a60698"
    }, {
        "_id": "689011a5893769dbef674264",
        "nombre": "sdf",
        "categoria": "electrodomesticos",
        "watts": 45,
        "color": "#c584ff",
        "imagen": "f2279c6a6804d930f3a9bbfd3fcac4cd.jpg",
        "state": True,
        "created_at": [
            ["2025-08-04T03:26:58.966882", None]
        ],
        "email": "crisesv4@gmail.com",
        "stringid": "2950cfad-8a6d-4906-a875-ff39c8a60698"
    }
]
print(CalculateCO2forDevice(devices))