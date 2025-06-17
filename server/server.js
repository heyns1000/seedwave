// server.js
// This is your local Express.js backend server.
// It handles brand data and acts as a mock for a persistent database.
// It is intended to run locally via `node server.js` in a dedicated terminal.

const express = require('express');
const cors = require('cors'); 
const path = require('path'); // Import the 'path' module to handle file paths correctly
const app = express();
const port = 3000; // This port should be used by your frontend as BACKEND_LOCAL_SERVER_URL

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// Serve static files from the 'public' directory
// Use path.join to create a correct absolute path from the server.js location
// __dirname is the directory where the current script (server.js) resides (e.g., /Users/samantha/seedwave/server)
// '../public' means go up one directory (to /Users/samantha/seedwave) and then into 'public'
app.use(express.static(path.join(__dirname, '../public'))); 

// --- Mock Data Definitions (Source of Truth for Local Backend) ---
// These are hardcoded for simplicity in this mock backend.
// In a real application, this data would be fetched from a persistent database.

const sectorList = {
    "agriculture": "🌱 Agriculture & Biotech", "fsf": "🥦 Food, Soil & Farming",
    "banking": "🏦 Banking & Finance", "creative": "🖋️ Creative Tech",
    "logistics": "📦 Logistics & Packaging", "education-ip": "📚 Education & IP",
    "fashion": "✂ Fashion & Identity", "gaming": "🎮 Gaming & Simulation",
    "health": "🧠 Health & Hygiene", "housing": "🏗️ Housing & Infrastructure",
    "justice": "⚖ Justice & Ethics", "knowledge": "📖 Knowledge & Archives",
    "micromesh": "☰ Micro-Mesh Logistics", "media": "🎬 Motion, Media & Sonic",
    "nutrition": "✿ Nutrition & Food Chain", "ai-logic": "🧠 AI, Logic & Grid", 
    "packaging": "📦 Packaging & Materials", "quantum": "✴️ Quantum Protocols",
    "ritual": "☯ Ritual & Culture", "saas": "🔑 SaaS & Licensing",
    "trade": "🧺 Trade Systems", "utilities": "🔋 Utilities & Energy",
    "voice": "🎙️ Voice & Audio", "webless": "📡 Webless Tech & Nodes",
    "nft": "🔁 NFT & Ownership", "education-youth": "🎓 Education & Youth",
    "zerowaste": "♻️ Zero Waste", "professional": "🧾 Professional Services",
    "payroll-mining": "🪙 Payroll Mining & Accounting", "mining": "⛏️ Mining & Resources", 
    "wildlife": "🦁 Wildlife & Habitat"
};

const FAA_ZONE_INDEX_SUMMARY_DATA = {
    "agriculture": { glyph: "🌱", monthlyFee: "550.00", annualFee: "5500.00", payoutTier: "B+", region: "Global Rural" },
    "fsf": { glyph: "🥦", monthlyFee: "560.00", annualFee: "5800.00", payoutTier: "B+", region: "Rural" },
    "banking": { glyph: "�", monthlyFee: "1250.00", annualFee: "12500.00", payoutTier: "A+", region: "Div A-E" },
    "creative": { glyph: "🖋️", monthlyFee: "700.00", annualFee: "7500.00", payoutTier: "A", region: "Div E" },
    "logistics": { glyph: "📦", monthlyFee: "600.00", annualFee: "6100.00", payoutTier: "B+", region: "Div B-F" },
    "education-ip": { glyph: "📚", monthlyFee: "400.00", annualFee: "4300.00", payoutTier: "A", region: "Tribal/Global" },
    "fashion": { glyph: "✂", monthlyFee: "720.00", annualFee: "7800.00", payoutTier: "A", region: "Global Metro" },
    "gaming": { glyph: "🎮", monthlyFee: "850.00", annualFee: "8700.00", payoutTier: "A", region: "Global Digital" },
    "health": { glyph: "🧠", monthlyFee: "550.00", annualFee: "5800.00", payoutTier: "B", region: "Div F" },
    "housing": { glyph: "🏗️", monthlyFee: "620.00", annualFee: "6400.00", payoutTier: "B+", region: "Div A-F" },
    "justice": { glyph: "⚖", monthlyFee: "950.00", annualFee: "9800.00", payoutTier: "A", region: "Global Legal" },
    "knowledge": { glyph: "📖", monthlyFee: "580.00", annualFee: "6100.00", payoutTier: "B+", region: "Global Archives" },
    "micromesh": { glyph: "☰", monthlyFee: "650.00", annualFee: "6800.00", payoutTier: "B+", region: "Local/Regional" },
    "media": { glyph: "🎬", monthlyFee: "750.00", annualFee: "7700.00", payoutTier: "A", region: "Creative" },
    "nutrition": { glyph: "✿", monthlyFee: "500.00", annualFee: "5300.00", payoutTier: "B+", region: "Global" },
    "ai-logic": { glyph: "🧠", monthlyFee: "1100.00", annualFee: "11200.00", payoutTier: "A+", region: "Global" },
    "packaging": { glyph: "📦", monthlyFee: "680.00", annualFee: "7000.00", payoutTier: "B", region: "Div B" },
    "quantum": { glyph: "✴️", monthlyFee: "1350.00", annualFee: "13800.00", payoutTier: "A+", region: "Global Research" },
    "ritual": { glyph: "☯", monthlyFee: "700.00", annualFee: "7500.00", payoutTier: "A", region: "Div C" },
    "saas": { glyph: "🔑", monthlyFee: "1000.00", annualFee: "10300.00", payoutTier: "A", region: "Global" },
    "trade": { glyph: "🧺", monthlyFee: "900.00", annualFee: "9200.00", payoutTier: "A+", region: "Div A-F" },
    "utilities": { glyph: "🔋", monthlyFee: "750.00", annualFee: "7800.00", payoutTier: "B+", region: "Div A-Z" },
    "voice": { glyph: "🎙️", monthlyFee: "630.00", annualFee: "6600.00", payoutTier: "B", region: "Global" },
    "webless": { glyph: "📡", monthlyFee: "800.00", annualFee: "8200.00", payoutTier: "A", region: "Div D-G" },
    "nft": { glyph: "🔁", monthlyFee: "1250.00", annualFee: "12800.00", payoutTier: "A", region: "FAA IP" },
    "education-youth": { glyph: "🎓", monthlyFee: "420.00", annualFee: "4500.00", payoutTier: "A", region: "Global Youth" },
    "zerowaste": { glyph: "♻️", monthlyFee: "450.00", annualFee: "4800.00", payoutTier: "B", region: "Global" },
    "professional": { glyph: "🧾", monthlyFee: "1150.00", annualFee: "11800.00", payoutTier: "A", region: "Global" },
    "payroll-mining": { glyph: "🪙", monthlyFee: "1050.00", annualFee: "10800.00", payoutTier: "A+", region: "Global Finance" },
    "mining": { glyph: "⛏️", monthlyFee: "1600.00", annualFee: "19000.00", payoutTier: "A+", region: "Global Resources" },
    "wildlife": { glyph: "🦁", monthlyFee: "400.00", annualFee: "4200.00", payoutTier: "B", region: "Conservation Zones" }
};

const SECTOR_TIER_PRICING = {
    "Starter": { multiplier: 1, features: [] },
    "Pro": { multiplier: 2.5, features: [] },
    "Enterprise": { multiplier: 5, features: [] }
};

const ALL_BRANDS_DETAILS_BY_SECTOR = {
    "agriculture": [
        { name: 'AgroChain', subNodes: ['YieldNode™', 'SoilScan™', 'PestDetect™', 'CropTrace™'], details: {} },
        { name: 'CropSense', subNodes: ['BioTrack™', 'FoodPrint™', 'FarmFresh™'], details: {} },
        { name: 'FarmFresh', subNodes: ['NutriScore™', 'BioTrack™'], details: {} },
        { name: 'NutriScore', subNodes: ['FoodPrint™', 'FarmFresh™'], details: {} },
        { name: 'AgriCore', subNodes: ['SoilSync™', 'CropTrack™', 'FarmLink™'], details: {} },
        { name: 'SoilHealth', subNodes: ['BioBoost™', 'NutrientFlow™', 'EarthGuard™'], details: {} },
        { name: 'CropCircle', subNodes: ['YieldMap™', 'PlantPulse™'], details: {} },
        { name: 'HarvestHub', subNodes: ['GrainGate','ProducePath','MarketLink','FarmFlow'], details: {} },
        { name: 'TerraNova', subNodes: ['LandRevive','SoilBalance','EcoTill','AgroRenew'], details: {} },
        { name: 'GreenSprout', subNodes: ['SeedStart','PlantBoost','GrowTrack','EcoRoot'], details: {} },
        { name: 'AgroLife', subNodes: ['FarmVital','CropCare','SoilSense','HarvestEase'], details: {} },
        { name: 'BioFarm', subNodes: ['EcoGrow','NaturalYield','SoilPure','PlantHealth'], details: {} },
        { name: 'EcoHarvest', subNodes: ['GreenField','CropCycle','SoilNurture','FarmSustain'], details: {} },
        { name: 'SeedLink', subNodes: ['GerminatePro','PlantConnect','GrowNet','RootLink'], details: {} },
        { name: 'SoilSmart', subNodes: ['NutrientTrack','EarthMonitor','SoilScan','FertilEase'], details: {} },
        { name: 'FarmWise', subNodes: ['AgriPlan','CropManage','FieldGuide','HarvestLogic'], details: {} },
        { name: 'CropGuard', subNodes: ['PestShield','DiseaseControl','PlantProtect','YieldSecure'], details: {} },
        { name: 'HarvestEase', subNodes: ['GrainFlow','ProduceEase','MarketAccess','FarmSimplify'], details: {} },
        { name: 'TerraGrow', subNodes: ['LandEnrich','SoilEnhance','EcoFert','AgroBoost'], details: {} },
        { name: 'GreenField', subNodes: ['SeedSelect','PlantOptimize','GrowManage','EcoCultivate'], details: {} },
        { name: 'AgroTech', subNodes: ['FarmInnovate','CropTech','SoilAdvance','HarvestTech'], details: {} },
        { name: 'BioYield', subNodes: ['EcoProduce','NaturalHarvest','SoilRich','PlantGain'], details: {} },
        { name: 'EcoFarm', subNodes: ['GreenCultivate','CropSustain','SoilCare','FarmEco'], details: {} },
        { name: 'AgriPulse', subNodes: ['SoilMonitor','CropSensor','FieldData','HarvestAlert'], details: {} },
        { name: 'BioCrop', subNodes: ['OrganicSeed','PlantHealth','GrowthTrack','EcoYield'], details: {} },
        { name: 'FarmLink', subNodes: ['AgriConnect','FieldNet','CropShare','HarvestSync'], details: {} },
        { name: 'SoilGuard', subNodes: ['NutrientShield','ErosionControl','pHBalance','RootProtect'], details: {} },
        { name: 'GreenHarvest', subNodes: ['EcoCrop','SustainableYield','BioFertilizer','FarmSustain'], details: {} },
        { name: 'TerraFarm', subNodes: ['LandOptimize','SoilEnhance','CropBoost','AgroManage'], details: {} },
        { name: 'SeedSmart', subNodes: ['GerminationTrack','PlantMap','GrowthPredict','YieldForecast'], details: {} },
        { name: 'CropCare', subNodes: ['PestMonitor','DiseaseAlert','PlantHealthCheck','YieldSecure'], details: {} },
        { name: 'HarvestPro', subNodes: ['GrainQuality','ProduceSorting','MarketAccess','FarmLogistics'], details: {} },
        { name: 'SoilSense', subNodes: ['MoistureDetect','NutrientMap','SoilProfile','FertilityIndex'], details: {} },
        { name: 'FarmVision', subNodes: ['SatelliteImagery','CropAnalysis','FieldMapping','YieldEstimation'], details: {} },
        { name: 'AgroTech', subNodes: ['PrecisionFarming','SmartIrrigation','DroneSurvey','DataAnalytics'], details: {} },
        { name: 'BioSoil', subNodes: ['MicrobeEnhance','OrganicMatter','SoilRegen','EcoBalance'], details: {} },
        { name: 'CropTrack', subNodes: ['PlantGrowthMonitor','FieldProgress','HarvestTimeline','YieldReport'], details: {} },
        { name: 'HarvestLink', subNodes: ['SupplyChainConnect','ProduceTrace','MarketIntegration','FarmNetwork'], details: {} },
        { name: 'SoilLab', subNodes: ['pHTesting','NutrientAnalysis','SoilSampling','FertilityReport'], details: {} },
        { name: 'FarmManage', subNodes: ['TaskScheduler','ResourceAllocation','LaborTracking','EquipmentMonitor'], details: {} },
        { name: 'AgriData', subNodes: ['CropRecords','FieldHistory','YieldAnalytics','FarmReports'], details: {} },
        { name: 'BioGrow', subNodes: ['OrganicInputs','PlantNutrition','GrowthEnhancer','EcoSolutions'], details: {} },
        { name: 'EcoFarm', subNodes: ['SustainablePractices','RenewableEnergy','WasteManagement','Biodiversity'], details: {} },
        { name: 'CropMesh', subNodes: ['FieldNet','SoilGrid','YieldLink','NodeTrace'], details: {} },
        { name: 'SeedRoot', subNodes: ['GermCode','SeedID','RootLink','GrowthStart'], details: {} },
        { name: 'SoilVault', subNodes: ['VaultSoil','SampleSecure','LabLink','ResultSync'], details: {} },
        { name: 'PlantCast', subNodes: ['GrowthSignal','WeatherFeed','PlantAlert','FieldNotify'], details: {} },
        { name: 'YieldNode', subNodes: ['NodePath','HarvestTrace','ScrollYield','CropGrid'], details: {} },
        { name: 'FarmBeacon', subNodes: ['ZonePing','CropAlert','SignalYield','TraceLight'], details: {} },
        { name: 'BioSprout', subNodes: ['EcoSeed','VitalTrace','GreenMap','GrowStream'], details: {} },
        { name: 'SoilTrace', subNodes: ['SampleLink','DataStream','FertilMap','FieldTest'], details: {} },
        { name: 'HarvestCore', subNodes: ['HarvestPing','VendorClaim','YieldPoint','CrateDrop'], details: {} },
        { name: 'PlantLink', subNodes: ['PlantID','CrossNode','ZoneSync','QRRoot'], details: {} },
        { name: 'TerraLoop', subNodes: ['AgriCycle','SoilWave','CropSync','EcoChain'], details: {} },
        { name: 'SoilPulse', subNodes: ['PulseCheck','GrowthWave','DepthTrace','FieldFlow'], details: {} },
        { name: 'GreenPatch', subNodes: ['ZoneGrid','OrganicNode','FarmSquare','PlantDrop'], details: {} },
        { name: 'FarmSync', subNodes: ['SyncPoint','CropMerge','LandSplit','VendorMesh'], details: {} },
        { name: 'RootMesh', subNodes: ['NodeSeed','GridSprout','PathFert','MicroPulse'], details: {} },
        { name: 'BioCluster', subNodes: ['CropGroup','FieldChain','VendorLoop','YieldRing'], details: {} },
        { name: 'SproutIndex', subNodes: ['ZoneScan','PlantGrid','GrowthMeter','SeedSync'], details: {} },
        { name: 'MoistureMap', subNodes: ['AquaNode','RootHumidity','DepthScan','FieldAqua'], details: {} },
        { name: 'EcoZone', subNodes: ['GreenClaim','NaturalPath','FarmMesh','ZoneCert'], details: {} },
        { name: 'CropRelay', subNodes: ['YieldSync','VendorCast','CrateSend','RouteField'], details: {} },
        { name: 'FarmCloud', subNodes: ['ScrollFarm','VendorPanel','YieldDash','FieldUpload'], details: {} },
        { name: 'SoilFrame', subNodes: ['FrameID','EarthLine','GridSoil','TestPath'], details: {} },
        { name: 'HarvestPing', subNodes: ['PingGrid','DropYield','ClaimNode','AlertField'], details: {} },
        { name: 'CropCode', subNodes: ['BarcodeRoot','GrowthTag','ScrollField','LabelGrow'], details: {} },
        { name: 'AgroNode', subNodes: ['LandID','CropNode','FieldLink','SoilRoute'], details: {} },
        { name: 'SeedNest', subNodes: ['NestCode','SproutDrop','GrowthLog','FarmBase'], details: {} },
        { name: 'TraceFarm', subNodes: ['FarmScan','VendorLink','HarvestLedger','ScrollProof'], details: {} },
        { name: 'SproutChain', subNodes: ['ChainGrow','YieldLink','NodeDrop','EcoSprout'], details: {} },
        { name: 'SoilStack', subNodes: ['StackClaim','DepthScan','FertilRow','SoilVault'], details: {} },
        { name: 'AgriPanel', subNodes: ['PanelSync','ScrollDash','CropView','VendorControl'], details: {} },
        { name: 'RootClaim', subNodes: ['ClaimTrace','RootID','VendorStamp','FieldLock'], details: {} },
        { name: 'MoistureNode', subNodes: ['HydrateLink','DepthSync','MoistPulse','NodeRain'], details: {} },
        { name: 'CrateFarm', subNodes: ['CrateLedger','DropPanel','MarketNode','VendorCrate'], details: {} },
        { name: 'PlantPing', subNodes: ['AlertRoot','ScanGrow','PlantTrace','PingField'], details: {} },
        { name: 'AgroLoop', subNodes: ['LoopClaim','SoilCycle','FarmMesh','GrowthPath'], details: {} },
        { name: 'CropGrid', subNodes: ['GridYield','MapTrack','HarvestView','CropLink'], details: {} },
        { name: 'VendorSprout', subNodes: ['VendorID','FarmStart','ClaimMap','SproutVault'], details: {} },
        { name: 'BioPing', subNodes: ['MicroScan','HealthAlert','GrowthWatch','RootPath'], details: {} },
        { name: 'EcoFarmGrid', subNodes: ['EcoPlot','FarmJoin','GreenPanel','ZoneMesh'], details: {} },
        { name: 'TerraCode', subNodes: ['SoilDNA','SeedLog','CropCodeX','ScanTag'], details: {} },
        { name: 'HarvestVault', subNodes: ['VaultDrop','CrateClaim','PayoutLock','FieldSecure'], details: {} },
        { name: 'CropBinder', subNodes: ['BinderLoop','VendorTrace','ScrollTag','FarmCode'], details: {} },
        { name: 'SoilCertify', subNodes: ['TestLog','ResultPath','QRProof','SoilPass'], details: {} }
    ],
    "fsf": [
        { name: 'FarmFresh', subNodes: ['BioTrack'], details: {} },
        { name: 'NutriScore', subNodes: ['FoodPrint'], details: {} }
    ],
    "banking": [
        {   
            name: 'FinGrid',   
            subNodes: ['Ledger Mesh','Arbitrage Core','Token Router','Tax Engine','Vault Lock','Compliance Matrix','Logistics Fin','Currency Glyph','Forecast Engine','Signal Tracker'],
            details: {
                intro: "FinGrid™ is the premier FAA.ZONE platform, revolutionizing Banking & Finance operations. Leveraging the global PulseGrid, it offers robust data synchronization and superior efficiency.",
                keyFeatures: [
                    "Direct Integration with FAA™ Professional Services Mesh.",
                    "Advanced data sync with Ledger Mesh.",
                    "Real-time compliance validation via VaultLink™ (banking specific).",
                    "Scalable architecture for x10 power expansion.",
                    "Predictive analytics module for FinGrid performance.",
                    "API access for seamless interoperability.",
                    "Self-optimizing node distribution for peak efficiency.",
                    "Customizable dashboard and alert systems.",
                    "Cross-sector data interoperability."
                ],
                metadata: {
                    productId: "FIN-BAN-5369",
                    vaultId: "VAULT-212U",
                    signalEchoLayer: "Layer Beta v2.5",
                    deploymentZone: "Zone C 4",
                    securityRating: "FAA-SEC B+",
                    activeNodes: "11,810",
                    lastSync: "2025-06-13 18:00 SAST",
                    complianceStatus: "Active & Certified"
                },
                realTimeMetrics: {
                    currentPulseActivity: "90,109 pulses/sec",
                    dataVolumeProcessed: "89.66 TB",
                    latencyAverage: "34 ms"
                },
                vaultTraceEntries: [
                    "#3514 - FINGA Pulse Tx - Confirmed",
                    "#9619 - BANKI Data Sync - Completed",
                    "#7880 - Node Activation Confirm - Offline",
                    "#128 - VaultTrace Audit - Passed"
                ]
            }
        },
        {   
            name: 'TradeAmp',   
            subNodes: ['Zeno Mesh','Crux Bridge','Hive Monitor','Wire Reconciler','Bit Locker','Credit Splice','Score Vector','Zentry Core','Drift Trace','Alpha Ledger'],
            details: {
                intro: "TradeAmp™ optimizes global trade finance with AI-driven liquidity and AI-driven fraud detection. Integrated with PulseTrade, it ensures high-speed, compliant, and transparent financial flows.",
                keyFeatures: [
                    "AI-driven liquidity optimization.",
                    "Immutable transaction ledgering.",
                    "Real-time fraud detection.",
                    "Automated compliance reporting.",
                    "Multi-currency support.",
                    "Smart contract integration for trade agreements."
                ],
                metadata: {
                    productId: "TRA-AMP-7001",
                    vaultId: "VAULT-220V",
                    signalEchoLayer: "Layer Gamma v3.0",
                    deploymentZone: "Zone A 1",
                    securityRating: "FAA-SEC A+",
                    activeNodes: "8,500",
                    lastSync: "2025-06-13 17:45 SAST",
                    complianceStatus: "Active & Certified"
                },
                realTimeMetrics: {
                    currentPulseActivity: "75,200 pulses/sec",
                    dataVolumeProcessed: "65.12 TB",
                    latencyAverage: "40 ms"
                },
                vaultTraceEntries: [
                    "#4122 - TRADEAMP Flow - Confirmed",
                    "#7789 - Payment Sync - Completed",
                    "#9901 - Trade Agreement Hash - Verified",
                    "#203 - Policy Audit - Passed"
                ]
            }
        },
        { name: 'LoopPay', subNodes: ['Lumen Pulse','Delta Secure','Fractal Trace','Torus Signal','Mint Bridge','Tally Stream','Bank Depth','Kite Path','Bond Engine','Echo Stack'], details: {} },
        { name: 'TaxNova', subNodes: ['Ark Model','Node Gate','Veritas Sync','Cage Mapper','Core Trace','Sky Sweep','Mint Grid','Orbit Channel','Hash Clear','Micro Chain'], details: {} },
        { name: 'VaultMaster', subNodes: ['Anchor Lock','Fleet Sync','Zoom Channel','Beacon Path','Crate Vault','Numen Index','Spark Flow','Meta Signal','Aether Drift','Custody Map'], details: {} },
        { name: 'Gridwise', subNodes: ['Neutron Signal','Cash Stream','Jet Grid','Pulse Map','Sync Grid','Tangent Vector','Nova Route','Glide Core','Trace Engine','Root Node'], details: {} },
        { name: 'CrateDance', subNodes: ['Bank Shift','Pillar Core','Axon Thread','Monet Route','Layer Core','Verge Node','Stack Tally','Crown Core','Prism Gate','Halo Grid'], details: {} },
        { name: 'CashGlyph', subNodes: ['Clearance Vector','Forge Sync','Bank Mesh','Nano Token','Lattice Path','Noble Curve','Chain Vector','Mint Grid','Bridge Path','Chrono Index'], details: {} },
        { name: 'Foresync', subNodes: ['Unity Sync','Trust Matrix','Vault Score','Lucid Gate','Mint Route','Flight Signal','Teller Index','Custody Trace','Flare Lock','Dark Stream'], details: {} },
        { name: 'OmniRank', subNodes: ['Origin Pulse','Shard Bank','Pay Score','Altimeter Path','Clearing Core','Frame Lock','Zenith Route','Score Helix','Meta Stack','Crux Trace'], details: {} },
        { name: 'ZenoBank', subNodes: ['Pulse Engine','Balance Tally','Gold Trace','Stack Mesh','Quantum Sync','Script Pulse','Vault Stack','Trust Model','Hyper Lock','Tone Gate'], details: {} },
        { name: 'CruxSpend', subNodes: ['Grid Index','Line Mesh','Alpha Signal','Logic Gate','Yield Route','Ratio Core','Ledger Path','Prime Helix','Amp Signal','Lattice Node'], details: {} },
        { name: 'PulseHive', subNodes: ['Credit Curve','Vault Pulse','Data Mesh','Ring Gate','Glyph Stack','Bank Channel','Zen Gate','Loop Vault','Axial Index','Loop Stack'], details: {} },
        { name: 'WireVault', subNodes: ['Pulse Vector','Bank Curve','Helix Gate','Teller Pulse','Tally Signal','Mint Vault'], details: {} }
    ],
    "creative": [
        { name: 'ArtStream', subNodes: ['PixelNode'], details: {} },
        { name: 'DesignHub', subNodes: ['IdeaGrid'], details: {} }
    ],
    "logistics": [
        { name: 'CrateLogic', subNodes: ['BoxNode™', 'CrateMap™', 'PackSync™', 'CrateSync™'], details: {} },
        { name: 'PackChain', subNodes: ['VendorPack™', 'LabelTrace™', 'ShipGrid™', 'ScrollWrap™'], details: {} },
        { name: 'SortFleet', subNodes: ['SortPulse™', 'BinLogic™', 'FleetTrack™', 'ScrollSort™'], details: {} },
        { name: 'RouteMesh', subNodes: ['NodeMap™', 'GeoSignal™', 'DropLink™', 'RouteFlow™'], details: {} },
        { name: 'LogiStack', subNodes: ['ScrollStack™', 'YieldSync™', 'PayoutRoute™', 'StackNode™'], details: {} },
        { name: 'DeliveryX', subNodes: ['LastMile™', 'ScanDrop™', 'AgentTrack™', 'QuickChain™'], details: {} },
        { name: 'CargoVault', subNodes: ['VaultLink™', 'WeightTag™', 'CargoScan™', 'CargoClaim™'], details: {} },
        { name: 'PalletPath', subNodes: ['PathFinder™', 'RackTrace™', 'GridStore™', 'LoadMark™'], details: {} },
        { name: 'LabelFlow', subNodes: ['PrintNode™', 'ScrollCode™', 'InkRoute™', 'LabelSync™'], details: {} },
        { name: 'DropLoop', subNodes: ['LoopID™', 'VendorDrop™', 'TimeGate™', 'LoopConfirm™'], details: {} },
        { name: 'ScrollRoute', subNodes: ['ChainStep™', 'ScanRoute™', 'RouteTrace™', 'FinalMile™'], details: {} },
        { name: 'ShipLedger', subNodes: ['ManifestScroll™', 'LogiProof™', 'ShipCert™', 'DockNode™'], details: {} },
        { name: 'FreightCore', subNodes: ['FreightID™', 'CrateStamp™', 'CargoPulse™', 'StackSync™'], details: {} },
        { name: 'PackSphere', subNodes: ['SphereNode™', 'PackLoop™', 'SupplyCircle™', 'HubRelay™'], details: {} },
        { name: 'GridDrop', subNodes: ['DropTrace™', 'DropID™', 'GridYield™', 'NodeFlow™'], details: {} },
        { name: 'AutoTrack', subNodes: ['GPSClaim™', 'RouteLog™', 'TrackPulse™', 'AutoLink™'], details: {} },
        { name: 'ChainWrap', subNodes: ['WrapNode™', 'TieGlyph™', 'SealMark™', 'ScanProof™'], details: {} },
        { name: 'BinLogicX', subNodes: ['LogicChip™', 'BinSync™', 'ScrollSnap™', 'BinWave™'], details: {} },
        { name: 'PouchNode', subNodes: ['PouchTag™', 'ScrollStick™', 'PackPush™', 'MicroWrap™'], details: {} },
        { name: 'ColdFleet', subNodes: ['ChillRoute™', 'IceLedger™', 'ColdDrop™', 'VaultIce™'], details: {} },
        { name: 'TrackStack', subNodes: ['SignalTag', 'ScrollFleet', 'DockSync', 'TrackMap'], details: {} },
        { name: 'NodeRoute', subNodes: ['HopLink', 'NodeShift', 'MeshGrid', 'RouteCert'], details: {} },
        { name: 'PackOS', subNodes: ['ScrollOS', 'RouteWrap', 'ForkNode', 'PalletLogic'], details: {} },
        { name: 'ZipCrate', subNodes: ['AutoFold', 'SpeedTag', 'CrateDrop', 'ZipSeal'], details: {} },
        { name: 'TagLogic', subNodes: ['ScrollTag', 'GeoTrack', 'TagFrame', 'AutoCert'], details: {} },
        { name: 'ScrollTruck', subNodes: ['ScrollDriver', 'YieldScan', 'CargoBoard', 'DockLink'], details: {} },
        { name: 'FlowVault', subNodes: ['VaultID', 'ScrollStream', 'BoxYield', 'FlowMap'], details: {} },
        { name: 'SortStack', subNodes: ['BinRank', 'BinPulse', 'FastCrate', 'LogicDrop'], details: {} },
        { name: 'DockGrid', subNodes: ['DockFrame', 'PermitTrack', 'ScrollAccess', 'GateID'], details: {} },
        { name: 'RollFleet', subNodes: ['WheelNode', 'PalletSync', 'LoadProof', 'ScrollAxle'], details: {} },
        { name: 'VendSort', subNodes: ['VendorSort', 'BoxPush', 'AutoTray', 'YieldLoop'], details: {} },
        { name: 'GridCrate', subNodes: ['CrateNode', 'GridWrap', 'VaultStack', 'ScrollRoute'], details: {} },
        { name: 'LogiLift', subNodes: ['LiftID', 'FreightPulse', 'ForkSync', 'LogiTag'], details: {} },
        { name: 'CrateX', subNodes: ['CrateTrack', 'SmartLock', 'LabelLink', 'ScrollMap'], details: {} },
        { name: 'QuickLabel', subNodes: ['ScanCode', 'SmartPrint', 'RouteLabel', 'LabelCast'], details: {} },
        { name: 'DropLedger', subNodes: ['LedgerPath', 'DropFlow', 'VaultDrop', 'QuickClaim'], details: {} },
        { name: 'FleetTrace', subNodes: ['TruckPulse', 'ScrollRide', 'AutoPath', 'CrateEcho'], details: {} },
        { name: 'BoxSync', subNodes: ['ScrollSync', 'BoxFrame', 'ClaimID', 'TagSnap'], details: {} },
        { name: 'ChainGate', subNodes: ['GateLog', 'DockPush', 'YieldGate', 'EntryPulse'], details: {} },
        { name: 'ColdRoute', subNodes: ['FreezePoint', 'ScanChill', 'ColdMesh', 'ChillPath'], details: {} },
        { name: 'PalletCore', subNodes: ['CoreLift', 'PalletID', 'PackForce', 'VaultRack'], details: {} },
        { name: 'FreightLine', subNodes: ['LineTrack', 'StackChain', 'DockGrid', 'RouteNode'], details: {} },
        { name: 'PackSignal', subNodes: ['SignalDrop', 'YieldBeacon', 'PackNode', 'PathSync'], details: {} },
        { name: 'ChainVault', subNodes: ['ClaimLink', 'ScrollCert', 'LockDrop', 'AssetTag'], details: {} },
        { name: 'CrateThread', subNodes: ['CrateLink', 'ThreadMark', 'GridLoop', 'FastTag'], details: {} },
        { name: 'ForkYield', subNodes: ['ForkView', 'YieldNode', 'RouteTrek', 'PalletWave'], details: {} },
        { name: 'DockLogic', subNodes: ['DockTag', 'GridScan', 'ZonePath', 'DockAccess'], details: {} },
        { name: 'LoadCast', subNodes: ['LoadSync', 'CrateWatch', 'NodePing', 'AutoConfirm'], details: {} },
        { name: 'TrayTrack', subNodes: ['TrayID', 'PulseLift', 'VendorCrate', 'SyncScan'], details: {} },
        { name: 'ScrollDrop', subNodes: ['AutoYield', 'ScrollLift', 'DropFlag', 'TagNode'], details: {} },
        { name: 'LoopXpress', subNodes: ['LoopSync', 'VendorPush', 'ScrollLoop', 'DropNext'], details: {} },
        { name: 'PackSyncPro', subNodes: ['ProTrack', 'QuickCrate', 'YieldStamp', 'CoreLoop'], details: {} },
        { name: 'VendorWrap', subNodes: ['WrapID', 'VendorPath', 'SecureDrop', 'LabelGate'], details: {} },
        { name: 'CrateLedger', subNodes: ['CrateLock', 'LedgerPath', 'PackTrace', 'AutoCert'], details: {} },
        { name: 'BoxNodeX', subNodes: ['NodeFlow', 'ClaimLock', 'ScanYield', 'FrameTag'], details: {} },
        { name: 'AutoRoute', subNodes: ['AutoJump', 'PathCalc', 'GridRelay', 'VendorMap'], details: {} },
        { name: 'VaultBin', subNodes: ['BinTag', 'SecureBin', 'VaultSignal', 'TraceStore'], details: {} },
        { name: 'LabelTrack', subNodes: ['TrackMark', 'LabelPath', 'QRDrop', 'LabelFlow'], details: {} },
        { name: 'PathLock', subNodes: ['SecurePath', 'ScrollFence', 'LockGate', 'PathProof'], details: {} },
        { name: 'DispatchLoop', subNodes: ['LoopID', 'DispatchSync', 'TagRelease', 'VendorTrack'], details: {} },
        { name: 'ChainPulse', subNodes: ['PulseLink', 'FlowTrack', 'CrateAlert', 'LockSync'], details: {} },
        { name: 'FastTag', subNodes: ['TagFire', 'IDScan', 'QRClaim', 'RouteAlert'], details: {} },
        { name: 'VendorFleet', subNodes: ['FleetMap', 'ScanRoute', 'YieldClaim', 'ChainAccess'], details: {} },
        { name: 'ParcelSync', subNodes: ['SyncBox', 'DropScan', 'AutoLabel', 'ParcelID'], details: {} },
        { name: 'SmartCrate', subNodes: ['SmartClaim', 'CrateGrid', 'LockTrack', 'RFIDNode'], details: {} },
        { name: 'AutoLabel', subNodes: ['LabelSnap', 'PrintFlow', 'AutoScan', 'ConfirmPrint'], details: {} },
        { name: 'FreightGrid', subNodes: ['GridPath', 'LoadBoard', 'VaultTag', 'ShipClaim'], details: {} },
        { name: 'DockFlow', subNodes: ['DockSignal', 'AccessNode', 'LabelCheck', 'LoadLink'], details: {} },
        { name: 'CrateBox', subNodes: ['BoxSync', 'SmartTag', 'FrameDrop', 'PalletLink'], details: {} },
        { name: 'ColdTrack', subNodes: ['ChillLoop', 'IceNode', 'VaultChill', 'ScrollCold'], details: {} },
        { name: 'SecureMesh', subNodes: ['MeshID', 'PathSecure', 'GateTrace', 'NodeFence'], details: {} },
        { name: 'LoopDispatch', subNodes: ['VendorLoop', 'DropTick', 'AutoYield', 'QRConfirm'], details: {} },
        { name: 'AutoLift', subNodes: ['LiftID', 'TrayPush', 'ForkLoop', 'WeightGate'], details: {} },
        { name: 'ClaimBoard', subNodes: ['BoardCert', 'VendorPush', 'ScrollAttach', 'ProofLine'], details: {} },
        { name: 'ParcelChain', subNodes: ['ChainTrack', 'QuickDrop', 'VendorClaim', 'FastLock'], details: {} },
        { name: 'LabelMesh', subNodes: ['MeshLink', 'TagGrid', 'LabelView', 'ClaimLink'], details: {} },
        { name: 'BoxSignal', subNodes: ['BoxAlert', 'SignalPulse', 'FrameCheck', 'DropYield'], details: {} },
        { name: 'LoadFrame', subNodes: ['LoadDetect', 'CrateSignal', 'DropCheck', 'ScanLine'], details: {} },
        { name: 'VaultRoute', subNodes: ['RouteClaim', 'SignalSync', 'LockMap', 'PathMark'], details: {} },
        { name: 'DockYield', subNodes: ['DockCrate', 'YieldNode', 'SignalTrack', 'ClaimPulse'], details: {} },
        { name: 'CrateSecure', subNodes: ['SecureTag', 'LockCrate', 'VaultProof', 'ChainLock'], details: {} },
        { name: 'LabelFlowX', subNodes: ['FlowTag', 'LabelSync', 'ScanRoute', 'PrintID'], details: {} },
        { name: 'DockMaster', subNodes: ['MasterDock', 'DockTrack', 'LoadSync', 'AccessNode'], details: {} },
        { name: 'PackNet', subNodes: ['NetCrate', 'PackSync', 'NodeLink', 'ChainFlow'], details: {} },
        { name: 'RouteGuard', subNodes: ['GuardRoute', 'PathSecure', 'SignalLock', 'TrackID'], details: {} },
        { name: 'BinLogicPro', subNodes: ['ProBin', 'LogicSync', 'BinTrack', 'NodeProof'], details: {} },
        { name: 'ColdChainX', subNodes: ['ChillTrack', 'ColdSync', 'FreezeNode', 'IceFlow'], details: {} },
        { name: 'AutoPack', subNodes: ['PackAuto', 'SyncLabel', 'AutoCrate', 'FlowNode'], details: {} },
        { name: 'ShipTrack', subNodes: ['TrackShip', 'ShipSync', 'RouteNode', 'DockFlow'], details: {} },
        { name: 'LoadManager', subNodes: ['ManageLoad', 'LoadTrack', 'SyncCrate', 'NodeLink'], details: {} },
        { name: 'CrateManager', subNodes: ['ManageCrate', 'CrateSync', 'VaultTrack', 'LockNode'], details: {} }
    ],
    "education-ip": [
        { name: 'EduNest', subNodes: ['LearnNode', 'ScrollSeed', 'CampusID', 'MentorLink', 'PathClaim'], details: {} },
        { name: 'FormFlex', subNodes: ['SkillWrap', 'GradeSync', 'CourseMap', 'IDTrack', 'PupilMesh'], details: {} },
        { name: 'ScrollBooks', subNodes: ['ChapterFlow', 'StoryTag', 'QuizLink', 'YieldRead', 'TextClaim'], details: {} },
        { name: 'MindLift', subNodes: ['BoostTrack', 'LearnSignal', 'LevelUp', 'FocusPath', 'VaultPace'], details: {} },
        { name: 'GridClass', subNodes: ['ClassNode', 'TeachSync', 'VaultBoard', 'EduAlert', 'NodeAttend'], details: {} },
        { name: 'YouthSignal', subNodes: ['SignalDrop', 'SkillPing', 'PeerMesh', 'RoleAssign', 'TrackEcho'], details: {} },
        { name: 'TalentNest', subNodes: ['TalentVault', 'ClaimCoach', 'RoleTree', 'PayoutPath', 'CertifyNode'], details: {} },
        { name: 'PeerPath', subNodes: ['PeerMap', 'ConnectNode', 'SkillVote', 'PathSync', 'LearnOrbit'], details: {} },
        { name: 'ScrollGrade', subNodes: ['GradeID', 'TestVault', 'YieldCredit', 'ExamSync', 'ResultNode'], details: {} },
        { name: 'LearnMesh', subNodes: ['MeshID', 'ModuleLink', 'ClassSync', 'ProgressTag', 'LoopNode'], details: {} },
        { name: 'EduChain', subNodes: ['CourseLink', 'CreditVault', 'CertDrop', 'LearnKey', 'ScrollLedger'], details: {} },
        { name: 'SkillCast', subNodes: ['CastAward', 'NodeBadge', 'VaultProof', 'ScrollCredit', 'ChainEarn'], details: {} },
        { name: 'YouthForge', subNodes: ['ForgePath', 'BuildMesh', 'IdeaClaim', 'LearnFoundry', 'PeerLoop'], details: {} },
        { name: 'QuizNet', subNodes: ['QuizTrigger', 'TestField', 'GradeWave', 'RecallGrid', 'PassSync'], details: {} },
        { name: 'ScrollLabs', subNodes: ['LabNode', 'ProjectClaim', 'IdeaTrace', 'SkillXP', 'ModuleYield'], details: {} },
        { name: 'LearnFlag', subNodes: ['FlagRaise', 'SchoolLink', 'RegionTrack', 'PupilEcho', 'ClaimNode'], details: {} },
        { name: 'ScholarMesh', subNodes: ['MeshTrack', 'GradeRelay', 'ScrollDegree', 'LearnVault', 'StudyPulse'], details: {} },
        { name: 'VaultEdu', subNodes: ['IDVault', 'CertChain', 'TranscriptGrid', 'SecureLearn', 'DegreeDrop'], details: {} },
        { name: 'YouthSphere', subNodes: ['CircleCast', 'ClassLink', 'ScrollTribe', 'GroupEcho', 'PeerRing'], details: {} },
        { name: 'EduGlow', subNodes: ['SignalLight', 'LearnPulse', 'BrainSync', 'FlashGrade', 'EnlightNode'], details: {} },
        { name: 'LearnBloom', subNodes: ['BloomNode', 'GrowthTrack', 'SkillSeed', 'EduSprout', 'PeerSoil'], details: {} },
        { name: 'MentorLoop', subNodes: ['LoopConnect', 'WisdomPath', 'MentorVault', 'ScrollPing', 'TeachBond'], details: {} },
        { name: 'YouthID', subNodes: ['IDSync', 'LearnerNode', 'ProofTag', 'IdentityScroll', 'JoinClass'], details: {} },
        { name: 'ScrollQuiz', subNodes: ['QuizNode', 'AnswerTag', 'TimerMesh', 'ScoreClaim', 'ReviewPulse'], details: {} },
        { name: 'PupilChain', subNodes: ['PupilBlock', 'TaskNode', 'LedgerPath', 'EduEcho', 'LearnLock'], details: {} },
        { name: 'IdeaGrid', subNodes: ['IdeaDrop', 'GridThink', 'SparkVault', 'PeerPush', 'ThoughtClaim'], details: {} },
        { name: 'VaultLearn', subNodes: ['SecureScroll', 'GradeLock', 'ChainTest', 'RecordMesh', 'PayoutGrade'], details: {} },
        { name: 'SkillNest', subNodes: ['NestGrow', 'RoleTree', 'PeerRoot', 'MentorNode', 'CertPulse'], details: {} },
        { name: 'ClassFlow', subNodes: ['FlowSync', 'ClassRoute', 'PeerGroup', 'ScrollRing', 'LessonCast'], details: {} },
        { name: 'CertifyCast', subNodes: ['CastAward', 'NodeBadge', 'VaultProof', 'ScrollCredit', 'ChainEarn'], details: {} },
        { name: 'PathMentor', subNodes: ['MentorMap', 'GrowthLink', 'TrailNode', 'ScrollCoach', 'PeerTrace'], details: {} },
        { name: 'IdeaNest', subNodes: ['NestPath', 'SparkClaim', 'ScrollTree', 'PupilEcho', 'ThoughtPulse'], details: {} },
        { name: 'SchoolVault', subNodes: ['VaultGate', 'IDBoard', 'RosterDrop', 'GridEnroll', 'SecureClass'], details: {} },
        { name: 'LearnSignal', subNodes: ['SignalNode', 'BrainPing', 'LessonTrack', 'EduCast', 'PathAlert'], details: {} },
        { name: 'GridBadge', subNodes: ['BadgeSync', 'PathAward', 'TagNode', 'CreditDrop', 'CertLock'], details: {} },
        { name: 'ScrollCraft', subNodes: ['CraftScroll', 'YieldPath', 'PeerSkill', 'VaultMaker', 'ProjectPulse'], details: {} },
        { name: 'MindBoard', subNodes: ['BoardTag', 'ClassSignal', 'IdeaPost', 'TaskDrop', 'VoteMark'], details: {} },
        { name: 'ClassEcho', subNodes: ['EchoNode', 'SyncMesh', 'StudentCast', 'AlertPing', 'ScrollPlay'], details: {} },
        { name: 'VaultPupil', subNodes: ['PupilID', 'SecureClaim', 'GradeVault', 'TrackNode', 'CertTrigger'], details: {} },
        { name: 'YouthSignal', subNodes: ['PeerAlert', 'LoopClaim', 'ScrollWave', 'VoiceDrop', 'IDMesh'], details: {} },
        { name: 'TeachStack', subNodes: ['StackLink', 'LessonPulse', 'GradeBeam', 'TrackNode', 'PeerPath'], details: {} },
        { name: 'StudyCast', subNodes: ['StudyStream', 'PeerJoin', 'QuizSignal', 'ReviewGrid', 'ClassLink'], details: {} },
        { name: 'RoleGrid', subNodes: ['RoleMap', 'ClaimSync', 'PeerTree', 'IdentityPath', 'TagTrack'], details: {} },
        { name: 'LearnFrame', subNodes: ['FrameNode', 'LessonTrace', 'PupilMesh', 'CastDrop', 'ScoreProof'], details: {} },
        { name: 'PulseAcademy', subNodes: ['AcademyPing', 'PeerLight', 'FocusPath', 'VaultLearn', 'BadgeSync'], details: {} },
        { name: 'GradeSync', subNodes: ['GradeLink', 'ResultEcho', 'TestMesh', 'PassTrack', 'VaultSheet'], details: {} },
        { name: 'TeachCircle', subNodes: ['CircleCast', 'MentorPulse', 'ScrollBeam', 'IdeaClaim', 'PeerRing'], details: {} },
        { name: 'CampusNet', subNodes: ['CampusID', 'GroupPath', 'ScrollZone', 'PeerAlert', 'ConnectMesh'], details: {} },
        { name: 'StudyBoard', subNodes: ['StudyNode', 'NoteTrace', 'ProjectGrid', 'SyncClaim', 'ViewRank'], details: {} },
        { name: 'ScrollPath', subNodes: ['PathLink', 'VaultCredit', 'PeerYield', 'LessonGrid', 'ClassSync'], details: {} },
        { name: 'LearnQuest', subNodes: ['QuestNode', 'MapTrack', 'StudyGoal', 'ProgressPath', 'PeerSignal'], details: {} },
        { name: 'EduNestPro', subNodes: ['NestID', 'PathPulse', 'MentorNode', 'VaultGrade', 'PupilClaim'], details: {} },
        { name: 'LoopStudy', subNodes: ['StudyLoop', 'GridSync', 'QuizWave', 'PeerCast', 'ReviewTrack'], details: {} },
        { name: 'GradeForge', subNodes: ['ForgeNode', 'GradeRing', 'ResultPush', 'CertPath', 'LearnLine'], details: {} },
        { name: 'IdeaLink', subNodes: ['SparkLine', 'LoopLink', 'IdeaDrop', 'MentorPing', 'ClassTrace'], details: {} },
        { name: 'TeachTrack', subNodes: ['ClassFlow', 'InstructorNode', 'FeedbackGrid', 'PeerScore', 'PathEcho'], details: {} },
        { name: 'VaultClass', subNodes: ['SecureNode', 'RosterClaim', 'EnrollTrack', 'PeerMap', 'ClassKey'], details: {} },
        { name: 'BadgeMesh', subNodes: ['BadgeID', 'VaultLink', 'ScrollProof', 'AwardBeam', 'PayoutPing'], details: {} },
        { name: 'EduCast', subNodes: ['CoursePing', 'ClassSignal', 'LectureDrop', 'QuizRelay', 'PeerPush'], details: {} },
        { name: 'YouthGrid', subNodes: ['MeshLearn', 'PeerTrace', 'StudyJoin', 'PupilMark', 'LessonSync'], details: {} },
        { name: 'LearnProof', subNodes: ['ProofID', 'CourseClaim', 'ScrollCert', 'VaultDrop', 'GradeLoop'], details: {} },
        { name: 'PathCoach', subNodes: ['CoachNode', 'RolePath', 'ScrollEcho', 'StudyChain', 'CertPush'], details: {} },
        { name: 'TalentID', subNodes: ['TalentClaim', 'VaultPass', 'SkillMap', 'IDScroll', 'LearnLock'], details: {} },
        { name: 'OmniPupil', subNodes: ['OmniLearn', 'ScrollLoop', 'ViewNode', 'ClassCast', 'IDTrack'], details: {} },
        { name: 'SchoolChain', subNodes: ['LedgerLearn', 'BlockEnroll', 'VaultBoard', 'PeerPath', 'ClassFlow'], details: {} },
        { name: 'GradeVault', subNodes: ['VaultClaim', 'CreditPing', 'ScoreSheet', 'SecureDrop', 'LedgerTrack'], details: {} }
    ],
    "fashion": [
        { name: 'FashionNest', subNodes: ['EchoNest', 'TrackSeal', 'GridPath', 'PulseTag', 'LoopForm', 'WearGrid'], details: {} },
        { name: 'StyleForm', subNodes: ['RunwayMesh', 'FashionPanel', 'TagSync', 'EchoForm', 'BeamLook', 'PulseTrack'], details: {} },
        { name: 'ChicClaim', subNodes: ['ClaimStyle', 'PulseBeam', 'TrackPanel', 'EchoClaim', 'SyncTag', 'LookNode'], details: {} },
        { name: 'RunwayPulse', subNodes: ['GridForm', 'LoopMesh', 'DropEcho', 'TrackWear', 'ClaimPanel', 'PulsePath'], details: {} },
        { name: 'TrendCast', subNodes: ['PulseRoot', 'EchoTrack', 'WearCast', 'BeamTrace', 'CrateDrop', 'ClaimMark'], details: {} },
        { name: 'BrandX', subNodes: ['LoopPanel', 'FashionDrop', 'TrackGrid', 'PulseCast', 'EchoWear', 'GridMark'], details: {} },
        { name: 'LuxLink', subNodes: ['LookSync', 'PanelTag', 'PulseLoop', 'TrackCrate', 'EchoSeal', 'GridNest'], details: {} },
        { name: 'VogueSync', subNodes: ['ClaimMesh', 'DropPath', 'PulseTag', 'EchoCast', 'TrackPoint', 'StyleFit'], details: {} },
        { name: 'ModeFrame', subNodes: ['EchoStyle', 'PanelClaim', 'PulseGrid', 'TrackNest', 'ClaimNode', 'SyncEcho'], details: {} },
        { name: 'GlamRoot', subNodes: ['TrackPulse', 'BeamCast', 'LookTag', 'EchoTrace', 'CratePanel', 'GridTrack'], details: {} },
        { name: 'FitTrack', subNodes: ['PulseBeam', 'StyleForm', 'LoopEcho', 'TrackClaim', 'SyncCast', 'CratePoint'], details: {} },
        { name: 'StyleMesh', subNodes: ['CrateSync', 'PulsePath', 'BeamLoop', 'StyleCrate', 'ClaimPanel', 'TrackFit'], details: {} },
        { name: 'VibeCast', subNodes: ['DropTrace', 'WearPanel', 'EchoNode', 'StylePulse', 'ClaimBeam', 'GridCast'], details: {} },
        { name: 'DressSync', subNodes: ['PanelCast', 'EchoPanel', 'ClaimDrop', 'TrackNest', 'PulseSync', 'StyleGrid'], details: {} },
        { name: 'FitGrid', subNodes: ['TagPath', 'WearEcho', 'PanelGrid', 'CrateStyle', 'SyncTrack', 'PulsePanel'], details: {} },
        { name: 'TrendPath', subNodes: ['FitDrop', 'EchoPoint', 'LoopStyle', 'CrateClaim', 'TrackRoot', 'PulseEcho'], details: {} },
        { name: 'StyleNode', subNodes: ['EchoTrack', 'SyncNode', 'PulseNest', 'WearTrace', 'GridEcho', 'BeamCrate'], details: {} },
        { name: 'CatwalkCore', subNodes: ['StylePanel', 'ClaimNest', 'LoopPath', 'DropPulse', 'SyncBeam', 'TrackPanel'], details: {} },
        { name: 'EchoWear', subNodes: ['PulseStyle', 'EchoGrid', 'BeamTrack', 'CrateSync', 'ClaimEcho', 'LookPath'], details: {} },
        { name: 'LuxuryClaim', subNodes: ['FormCrate', 'TrackSync', 'EchoDrop', 'PulseClaim', 'StyleMark', 'GridTrace'], details: {} },
        { name: 'SculptWear', subNodes: ['ClaimLoop', 'WearPanel', 'EchoStyle', 'DropSync', 'PulseGrid', 'BeamRoot'], details: {} },
        { name: 'FitClaim', subNodes: ['StyleEcho', 'LoopBeam', 'CratePanel', 'TrackCrate', 'GridNode', 'PulseNest'], details: {} },
        { name: 'RunwayLoop', subNodes: ['PulseTrack', 'WearTag', 'PanelRoot', 'ClaimCast', 'StyleLoop', 'DropPath'], details: {} },
        { name: 'VogueMesh', subNodes: ['TraceBeam', 'LookClaim', 'EchoGrid', 'PanelTrack', 'PulseDrop', 'TrackSync'], details: {} },
        { name: 'DressTrack', subNodes: ['EchoPulse', 'GridBeam', 'DropPanel', 'ClaimMark', 'CrateSync', 'PulseTrace'], details: {} },
        { name: 'ClassSync', subNodes: ['LoopEcho', 'TrackNest', 'ClaimPath', 'WearPanel', 'PulseLook', 'StyleDrop'], details: {} },
        { name: 'FitMark', subNodes: ['TagTrace', 'EchoForm', 'DropLook', 'PanelClaim', 'BeamNest', 'GridLoop'], details: {} },
        { name: 'ModeWave', subNodes: ['FitTrace', 'SyncNode', 'PulsePanel', 'ClaimEcho', 'TrackMark', 'LoopForm'], details: {} },
        { name: 'VogueDrop', subNodes: ['NodeClaim', 'StylePulse', 'PanelSync', 'DropTrack', 'CrateLoop', 'PulseEcho'], details: {} },
        { name: 'RunwayPoint', subNodes: ['PanelClaim', 'CrateBeam', 'TrackSync', 'EchoPanel', 'LoopGrid', 'PulseNest'], details: {} },
        { name: 'PulseWear', subNodes: ['LookBeam', 'PulseForm', 'DropTag', 'TrackEcho', 'ClaimNest', 'StyleSync'], details: {} },
        { name: 'GlamSync', subNodes: ['GridDrop', 'TagLoop', 'PanelTrack', 'EchoClaim', 'PulseMark', 'BeamNode'], details: {} },
        { name: 'TrendCore', subNodes: ['SyncLoop', 'PulseEcho', 'WearClaim', 'DropTrack', 'CratePanel', 'TrackRoot'], details: {} }
    ],
    "gaming": [
        { name: 'GameForge', subNodes: ['RenderNode', 'MatchSync'], details: {} },
        { name: 'PlayNexus', subNodes: ['QuestHub'], details: {} }
    ],
    "health": [
            { name: 'MedVault', subNodes: ['ScanID™', 'PatientDrop™', 'RecordLink™'], details: {} },
            { name: 'CleanCast', subNodes: ['SanitizeGrid™', 'QRLabel™', 'TouchLock™'], details: {} },
            { name: 'ScrollHealth', subNodes: ['ScrollID™', 'TreatmentTrack™', 'CareClaim™'], details: {} },
            { name: 'Hygienix', subNodes: ['WashCycle™', 'QRNode™', 'DisinfectLink™'], details: {} },
            { name: 'CareNode', subNodes: ['PatientSync™', 'PayoutCare™', 'NodeClaim™', 'AlertScan™'], details: {} },
            { name: 'VaultSan', subNodes: ['CleanTrace™', 'HygieneCert™', 'QRGrid™', 'SecureDrop™'], details: {} },
            { name: 'TrackMeds', subNodes: ['DoseTrack™', 'QRScript™', 'VaultDrug™', 'AlertLink™'], details: {} },
            { name: 'SteriMesh', subNodes: ['MeshDrop™', 'CleanEcho™', 'QRTrack™', 'SteriNode™'], details: {} },
            { name: 'MedLoop', subNodes: ['HealthPath™', 'PatientCast™', 'QRClaim™', 'VaultID™'], details: {} },
            { name: 'PulseClean', subNodes: ['PulseSync™', 'ScanLink™', 'SanitaryTag™', 'VaultLock™'], details: {} },
            { name: 'HealthDrop', subNodes: ['DropPoint™', 'TrackDose™', 'QRTrace™', 'MedNode™'], details: {} },
            { name: 'SanitiPath', subNodes: ['PathNode™', 'CleanSync™', 'HygieneRoute™', 'QRClaim™'], details: {} },
            { name: 'VaultMeds', subNodes: ['MedID™', 'TrackPill™', 'DropChart™', 'AlertLoop™'], details: {} },
            { name: 'BioPulse', subNodes: ['QRNode™', 'ScanVitals™', 'VaultRecord™', 'HealthPing™'], details: {} },
            { name: 'NurseFlow', subNodes: ['ShiftTrack™', 'AlertGrid™', 'VaultChart™', 'PeerLink™'], details: {} },
            { name: 'AirHealth', subNodes: ['VentFlow™', 'PurifyNode™', 'AirTrack™', 'CleanEcho™'], details: {} },
            { name: 'ScanCare', subNodes: ['CareID™', 'QRChart™', 'PatientGrid™', 'RecordVault™'], details: {} },
            { name: 'PathogenTrace', subNodes: ['PathNode™', 'TraceMap™', 'AlertDrop™', 'VaultScan™'], details: {} },
            { name: 'CareYield', subNodes: ['PayoutClaim™', 'CareNode™', 'VaultPay™', 'ScrollCert™'], details: {} },
            { name: 'SoapGrid', subNodes: ['WashSync™', 'DispenserLink™', 'QRNode™', 'VaultDrop™'], details: {} },
            { name: 'MedTrace', subNodes: ['TraceNode™', 'QRMap™', 'PatientPing™', 'RecordFlow™'], details: {} },
            { name: 'SteriLoop', subNodes: ['LoopClean™', 'VaultNode™', 'DisinfectClaim™', 'ScanPulse™'], details: {} },
            { name: 'BioScan', subNodes: ['BioNode™', 'TestTrace™', 'VaultLink™', 'QRResult™'], details: {} },
            { name: 'CareLink', subNodes: ['PatientNode™', 'ClaimGrid™', 'ScrollAlert™', 'VaultCare™'], details: {} },
            { name: 'VaultWell', subNodes: ['WellnessID™', 'QRPath™', 'DropNode™', 'HealthYield™'], details: {} },
            { name: 'DoseSync', subNodes: ['QRTrack™', 'PillGrid™', 'TimerClaim™', 'VaultDose™'], details: {} },
            { name: 'SanityTrack', subNodes: ['HygieneNode™', 'ScanTouch™', 'VaultDrop™', 'QRLoop™'], details: {} },
            { name: 'CleanPulse', subNodes: ['CleanLink™', 'QRSignal™', 'VaultMesh™', 'PathDrop™'], details: {} },
            { name: 'NurseGrid', subNodes: ['NurseID™', 'RosterFlow™', 'AlertRoute™', 'CareTag™'], details: {} },
            { name: 'ScanHealth', subNodes: ['ScanLoop™', 'QRVitals™', 'VaultDrop™', 'RecordTag™'], details: {} },
            { name: 'PureFlow', subNodes: ['WaterPath™', 'CleanYield™', 'VaultPipe™', 'QRDrop™'], details: {} },
            { name: 'MedCert', subNodes: ['CertID™', 'RecordNode™', 'QRVerify™', 'ScrollCare™'], details: {} },
            { name: 'SteriPack', subNodes: ['QRWrap™', 'VaultClean™', 'ScanShield™', 'DropKit™'], details: {} },
            { name: 'AlertCare', subNodes: ['SignalAlert™', 'PatientLoop™', 'QRNotify™', 'VaultTrack™'], details: {} },
            { name: 'VaultNurse', subNodes: ['NurseClaim™', 'QRPanel™', 'NodeTag™', 'ShiftProof™'], details: {} },
            { name: 'TrackVitals', subNodes: ['VitalID™', 'ScanPulse™', 'VaultTrack™', 'QRClaim™'], details: {} },
            { name: 'HygieneCast', subNodes: ['QRPush™', 'CleanNode™', 'VaultDrop™', 'SprayTrace™'], details: {} },
            { name: 'PatientSync', subNodes: ['ScrollTrack™', 'VaultChart™', 'QRPath™', 'IDNode™'], details: {} },
            { name: 'MedFuse', subNodes: ['VaultJoin™', 'QRClaim™', 'ScrollDose™', 'PatientLink™'], details: {} },
            { name: 'CleanChain', subNodes: ['QRLoop™', 'VaultMark™', 'HygieneFlow™', 'ScanProof™'], details: {} },
            { name: 'SoapNode', subNodes: ['FoamClaim™', 'VaultDispenser™', 'QRWash™', 'CleanTag™'], details: {} },
            { name: 'ScanDose', subNodes: ['DoseTrace™', 'QRScript™', 'VaultTrigger™', 'LabelNode™'], details: {} },
            { name: 'CareCast', subNodes: ['SignalDrop™', 'QRAlert™', 'NurseRoute™', 'VaultLink™'], details: {} },
            { name: 'HealthPing', subNodes: ['PingNode™', 'QRVital™', 'VaultTrack™', 'AlertBeam™'], details: {} },
            { name: 'PatientPath', subNodes: ['QRRoute™', 'MedID™', 'VaultDrop™', 'CareSync™'], details: {} },
            { name: 'PureVault', subNodes: ['VaultFlow™', 'QRDispenser™', 'HygieneLog™', 'ScanEcho™'], details: {} },
            { name: 'MedDrop', subNodes: ['DropForm™', 'ClaimScript™', 'QRLoop™', 'VaultNode™'], details: {} },
            { name: 'SanitiLoop', subNodes: ['LoopClean™', 'SprayNode™', 'VaultClaim™', 'HygieneGrid™'], details: {} },
            { name: 'AlertDose', subNodes: ['QRSignal™', 'VaultNotify™', 'ScheduleClaim™', 'DosePing™'], details: {} },
            { name: 'CleanLine', subNodes: ['LinePath™', 'QRCheck™', 'VaultFlow™', 'ScanProof™'], details: {} },
            { name: 'VaultVitals', subNodes: ['PulseID™', 'ScanNode™', 'QRTrack™', 'VitalsClaim™'], details: {} },
            { name: 'MaskTrack', subNodes: ['QRWear™', 'CleanFit™', 'VaultSync™', 'HygienePing™'], details: {} },
            { name: 'CarePrint', subNodes: ['PrintLabel™', 'QRScan™', 'DropVault™', 'CleanNode™'], details: {} },
            { name: 'SteriBoard', subNodes: ['BoardRoute™', 'HygieneLink™', 'VaultMap™', 'QRPath™'], details: {} },
            { name: 'NurseYield', subNodes: ['PayoutNode™', 'VaultCert™', 'NurseFlow™', 'QRSignal™'], details: {} },
            { name: 'BioTrack', subNodes: ['BioScan™', 'QRProof™', 'VaultClaim™', 'PatientEcho™'], details: {} },
            { name: 'VaultWellness', subNodes: ['ScrollCare™', 'QRDrop™', 'MedMesh™', 'RecordSync™'], details: {} },
            { name: 'TouchClean', subNodes: ['QRScan™', 'VaultTouch™', 'HygieneLock™', 'SignalNode™'], details: {} },
            { name: 'MedEcho', subNodes: ['EchoID™', 'VaultPanel™', 'QRPing™', 'RecordPath™'], details: {} },
            { name: 'PatientCert', subNodes: ['ScrollCert™', 'QRAccess™', 'VaultLedger™', 'ClaimLink™'], details: {} },
            { name: 'MedLogix', subNodes: ['TrackVault™', 'QRPanel™', 'PatientTag™', 'SyncChart™'], details: {} },
            { name: 'ScanSan', subNodes: ['HygieneScan™', 'QRRead™', 'VaultIndex™', 'CleanFlow™'], details: {} },
            { name: 'NurseCast', subNodes: ['CastPath™', 'QRBoard™', 'CarePulse™', 'VaultShift™'], details: {} },
            { name: 'TouchScan', subNodes: ['ScanNode™', 'TouchRead™', 'VaultMark™', 'QRTag™'], details: {} },
            { name: 'DoseVault', subNodes: ['VaultClaim™', 'QRDose™', 'TimerPath™', 'MedLabel™'], details: {} },
            { name: 'PathClean', subNodes: ['ScrollRoute™', 'QRScan™', 'VaultTrack™', 'PathEcho™'], details: {} },
            { name: 'SanitiID', subNodes: ['QRBadge™', 'VaultName™', 'ClaimID™', 'CleanCheck™'], details: {} },
            { name: 'RecordGrid', subNodes: ['RecordLoop™', 'VaultEntry™', 'QRNode™', 'ScanBook™'], details: {} },
            { name: 'PureCare', subNodes: ['QRFlow™', 'SanitizePath™', 'CareTouch™', 'VaultSync™'], details: {} },
            { name: 'MedClaim', subNodes: ['VaultSheet™', 'QRProof™', 'ScrollClaim™', 'SignalTrack™'], details: {} },
            { name: 'QRVitals', subNodes: ['VitalsTag™', 'QRTrack™', 'VaultPulse™', 'HealthNode™'], details: {} },
            { name: 'HygieneNode', subNodes: ['CleanLabel™', 'ScanEcho™', 'VaultDrop™', 'TagID™'], details: {} },
            { name: 'SoapDrop', subNodes: ['SoapPing™', 'QRTrigger™', 'DispenserLog™', 'VaultTrack™'], details: {} },
            { name: 'NurseVault', subNodes: ['VaultRoster™', 'NurseTrack™', 'ShiftID™', 'QRLog™'], details: {} },
            { name: 'BioClaim', subNodes: ['BioTrack™', 'VaultCert™', 'QRForm™', 'DNAPath™'], details: {} },
            { name: 'ScanWell', subNodes: ['QRClaim™', 'ScrollDrop™', 'VaultCare™', 'CheckPulse™'], details: {} },
            { name: 'SprayTrack', subNodes: ['SprayNode™', 'VaultStream™', 'QRPath™', 'HygieneFlow™'], details: {} },
            { name: 'CarePath', subNodes: ['QRTag™', 'NurseRoute™', 'VaultChart™', 'ShiftEcho™'], details: {} },
            { name: 'VaultScript', subNodes: ['ScriptID™', 'QRConfirm™', 'MedDrop™', 'ClaimProof™'], details: {} },
            { name: 'PatientLink', subNodes: ['QRBoard™', 'VaultJoin™', 'CarePass™', 'RecordTrack™'], details: {} },
            { name: 'SteriCheck', subNodes: ['CheckPulse™', 'VaultClean™', 'QRNode™', 'HygieneCert™'], details: {} },
            { name: 'HealthCast', subNodes: ['CastAlert™', 'QRSignal™', 'NodeDrop™', 'VaultClaim™'], details: {} },
            { name: 'DoseLink', subNodes: ['QRLabel™', 'VaultID™', 'TrackMed™', 'ScrollProof™'], details: {} },
            { name: 'TouchProof', subNodes: ['VaultLink™', 'CleanTrace™', 'ScanNode™', 'QRDrop™'], details: {} },
            { name: 'RecordVault', subNodes: ['FilePath™', 'QRPatient™', 'VaultScan™', 'ArchiveNode™'], details: {} },
            { name: 'MedPortal', subNodes: ['QRGate™', 'VaultOpen™', 'PatientCert™', 'NodePass™'], details: {} },
            { name: 'AlertVault', subNodes: ['SignalPing™', 'VaultEcho™', 'ScanNotify™', 'QRPath™'], details: {} },
            { name: 'ClaimDose', subNodes: ['DoseNode™', 'VaultRoute™', 'LabelScan™', 'QRClaim™'], details: {} },
            { name: 'CleanForm', subNodes: ['QRPanel™', 'VaultPath™', 'PrintTag™', 'DisinfectProof™'], details: {} },
            { name: 'ScanProof', subNodes: ['VaultDrop™', 'QRNode™', 'CertID™', 'PulseRecord™'], details: {} },
            { name: 'NurseSignal', subNodes: ['SignalNode™', 'QRChart™', 'VaultEcho™', 'RosterClaim™'], details: {} },
            { name: 'MedPathway', subNodes: ['QRLog™', 'PatientPath™', 'ScrollLink™', 'VaultMark™'], details: {} },
            { name: 'WellnessTrack', subNodes: ['TrackChart™', 'VaultPulse™', 'QRNode™', 'LoopScan™'], details: {} }
        ],
        "housing": [
            { name: 'BuildNest', subNodes: ['PlotVault', 'GridPermit', 'ScrollClaim', 'LandNode'], details: {} },
            { name: 'InfraGrid', subNodes: ['QRPipe', 'SignalTrace', 'VaultZone', 'NodeLayout'], details: {} },
            { name: 'CivicPath', subNodes: ['PermitID', 'RoutePlan', 'VaultForm', 'ZoningMesh'], details: {} },
            { name: 'VaultFrame', subNodes: ['FrameDrop', 'BuildQR', 'ClaimSync', 'SiteNode'], details: {} },
            { name: 'ArchiLoop', subNodes: ['DesignTrace', 'VaultDraw', 'BlueprintNode', 'CivicCast'], details: {} },
            { name: 'ScrollPlot', subNodes: ['QRClaim', 'VaultMap', 'LandTrack', 'NodePing'], details: {} },
            { name: 'UrbanTrace', subNodes: ['StreetPlan', 'VaultRoad', 'SignalGrid', 'SurveyNode'], details: {} },
            { name: 'BuildChain', subNodes: ['QRBuild', 'SiteVault', 'ContractorLink', 'NodePermit'], details: {} },
            { name: 'PlotMesh', subNodes: ['MeshTag', 'VaultCoord', 'ZoningNode', 'ClaimForm'], details: {} },
            { name: 'LandClaim', subNodes: ['ParcelGrid', 'PlotPath', 'VaultTag', 'ClaimNode'], details: {} },
            { name: 'CementDrop', subNodes: ['QRPour', 'NodeTrack', 'VaultMix', 'BatchSignal'], details: {} },
            { name: 'CivicVault', subNodes: ['RegisterPath', 'ZoningClaim', 'QRDrop', 'CivicNode'], details: {} },
            { name: 'StructFlow', subNodes: ['FrameSignal', 'VaultBeam', 'NodeGrid', 'BuildSync'], details: {} },
            { name: 'QRBuild', subNodes: ['BuildNode', 'ScrollTrace', 'VaultCheck', 'PermitQR'], details: {} },
            { name: 'RoadMapX', subNodes: ['QRRoute', 'VaultPath', 'PavingNode', 'InfraClaim'], details: {} },
            { name: 'SiteTrace', subNodes: ['QRZone', 'ClaimNode', 'VaultFlag', 'SurveyGrid'], details: {} },
            { name: 'CivicPlan', subNodes: ['GridNode', 'CouncilDrop', 'QRZoning', 'VaultSheet'], details: {} },
            { name: 'VaultRoof', subNodes: ['RooftopPing', 'BuildEcho', 'QRPanel', 'TileDrop'], details: {} },
            { name: 'PlotCast', subNodes: ['PlotSignal', 'VaultDrop', 'LandNode', 'QRClaim'], details: {} },
            { name: 'TileYield', subNodes: ['TileGrid', 'VaultTrack', 'QRPlace', 'PatternNode'], details: {} },
            { name: 'ScanPermit', subNodes: ['QRPermit', 'VaultForm', 'ZoneProof', 'ClaimSync'], details: {} },
            { name: 'BuildTrack', subNodes: ['ProgressScan', 'QRPlan', 'VaultStage', 'NodeEcho'], details: {} },
            { name: 'CementVault', subNodes: ['MixNode', 'VaultDrop', 'PourClaim', 'TagBatch'], details: {} },
            { name: 'GridScan', subNodes: ['QRSurvey', 'VaultMap', 'GeoTrack', 'NodeClaim'], details: {} },
            { name: 'SiteVault', subNodes: ['QRCode', 'SiteTrack', 'VaultBuild', 'PermitSync'], details: {} },
            { name: 'PermitGrid', subNodes: ['PermitNode', 'QRClaim', 'ZoningPing', 'VaultLink'], details: {} },
            { name: 'CivicPrint', subNodes: ['BlueprintDrop', 'VaultForm', 'DesignTrack', 'QRScan'], details: {} },
            { name: 'RoofMesh', subNodes: ['TileClaim', 'VaultPitch', 'QRShingle', 'LayoutNode'], details: {} },
            { name: 'ScrollYard', subNodes: ['YardMap', 'VaultPlace', 'GridNode', 'QRFence'], details: {} },
            { name: 'PlotLink', subNodes: ['QRMap', 'VaultConnect', 'GridPath', 'ClaimRoute'], details: {} },
            { name: 'GeoClaim', subNodes: ['VaultPlot', 'QRCoords', 'LandMesh', 'ScanMark'], details: {} },
            { name: 'PermitCast', subNodes: ['ClaimEcho', 'VaultPermit', 'QRBoard', 'RouteNode'], details: {} },
            { name: 'BuildYield', subNodes: ['PayoutNode', 'StageClaim', 'VaultCycle', 'QRProgress'], details: {} },
            { name: 'CivicEcho', subNodes: ['CivicNode', 'QRDrop', 'PlanLink', 'VaultLedger'], details: {} },
            { name: 'ArchiVault', subNodes: ['VaultDraft', 'ScanFloor', 'QRRender', 'NodeTrace'], details: {} },
            { name: 'ScrollPlan', subNodes: ['GridLine', 'QRClaim', 'VaultSheet', 'PermitTrace'], details: {} },
            { name: 'ZoningBoard', subNodes: ['MapNode', 'QRCheck', 'VaultProof', 'ZoneRoute'], details: {} },
            { name: 'SiteSnap', subNodes: ['NodePing', 'QRMap', 'VaultBuild', 'LandTag'], details: {} },
            { name: 'BuildBeam', subNodes: ['QRSpan', 'VaultFrame', 'ReinforceTrack', 'NodeSet'], details: {} },
            { name: 'InfraLoop', subNodes: ['InfraSignal', 'VaultRing', 'QRFlow', 'SiteNode'], details: {} },
            { name: 'CivicSync', subNodes: ['SyncNode', 'QRForm', 'CouncilClaim', 'VaultPath'], details: {} },
            { name: 'HousingVault', subNodes: ['TitleDrop', 'QRZone', 'VaultProof', 'ClaimKey'], details: {} },
            { name: 'LandNodeX', subNodes: ['GeoRoute', 'VaultClaim', 'QRTrack', 'ScanField'], details: {} },
            { name: 'ClaimBoard', subNodes: ['QRDesk', 'PermitFlow', 'VaultConfirm', 'GridEcho'], details: {} },
            { name: 'UrbanMap', subNodes: ['MapTrace', 'VaultPlan', 'SurveyQR', 'BuildPath'], details: {} },
            { name: 'BuildNet', subNodes: ['NetNode', 'QRPermit', 'VaultJoin', 'PathStage'], details: {} },
            { name: 'CivicGrid', subNodes: ['GridPass', 'ZoningPing', 'VaultLink', 'CouncilTrace'], details: {} },
            { name: 'FormPanel', subNodes: ['QRForm', 'PermitMark', 'VaultEntry', 'ScanLine'], details: {} },
            { name: 'YieldPermit', subNodes: ['ClaimPing', 'VaultProof', 'QRYield', 'GridSync'], details: {} },
            { name: 'StructMark', subNodes: ['QRBeam', 'FrameLink', 'VaultPath', 'NodeGrid'], details: {} },
            { name: 'PlanCast', subNodes: ['CastNode', 'QRDrop', 'VaultSync', 'BlueLine'], details: {} },
            { name: 'HousingID', subNodes: ['HouseTag', 'VaultLabel', 'QRTrack', 'ClaimFlow'], details: {} },
            { name: 'CementCast', subNodes: ['MixForm', 'QRNode', 'VaultDrop', 'YieldClaim'], details: {} },
            { name: 'TileProof', subNodes: ['TileMap', 'QRGrid', 'VaultShingle', 'NodePin'], details: {} },
            { name: 'GridYield', subNodes: ['YieldNode', 'QRTrack', 'VaultSync', 'PermitPath'], details: {} },
            { name: 'ArchPlan', subNodes: ['ArchiFlow', 'VaultClaim', 'QRNode', 'BlueprintTrack'], details: {} },
            { name: 'PlotSync', subNodes: ['LandMesh', 'QRPing', 'VaultMap', 'TagEcho'], details: {} },
            { name: 'CivicDrop', subNodes: ['ClaimVault', 'QRBoard', 'SyncTag', 'NodeSubmit'], details: {} },
            { name: 'ZonePath', subNodes: ['ZoneNode', 'QRRoute', 'VaultLock', 'GridTag'], details: {} },
            { name: 'ClaimGrid', subNodes: ['GridLock', 'VaultCheck', 'QRNode', 'SiteClaim'], details: {} },
            { name: 'TileVault', subNodes: ['QRSet', 'VaultGrid', 'PatternScan', 'ShingleClaim'], details: {} },
            { name: 'StructID', subNodes: ['IDTag', 'VaultNode', 'QRProof', 'BuildTrack'], details: {} },
            { name: 'CivicYield', subNodes: ['YieldCert', 'VaultPayout', 'GridTag', 'QRSplit'], details: {} },
            { name: 'BuildCert', subNodes: ['CertifyNode', 'QRPermit', 'VaultSync', 'ScanProof'], details: {} },
            { name: 'PlanNode', subNodes: ['NodeMap', 'VaultBoard', 'QRTrace', 'ZoneClaim'], details: {} },
            { name: 'ScrollBuild', subNodes: ['ScrollForm', 'QRDrop', 'VaultLine', 'PanelNode'], details: {} },
            { name: 'ZoneVault', subNodes: ['VaultProof', 'QRZone', 'ClaimRoute', 'MapTrace'], details: {} },
            { name: 'GridPermit', subNodes: ['PermitTrack', 'QRClaim', 'VaultDesk', 'PlanID'], details: {} },
            { name: 'TileCast', subNodes: ['TileEcho', 'QRLayer', 'VaultDrop', 'PatternID'], details: {} },
            { name: 'YieldCivic', subNodes: ['CouncilID', 'QRClaim', 'VaultShare', 'SyncNode'], details: {} },
            { name: 'HousingLoop', subNodes: ['LoopPath', 'VaultPing', 'ClaimSync', 'QRPermit'], details: {} },
            { name: 'BuildMark', subNodes: ['QRTag', 'MarkNode', 'VaultCert', 'ZoneDrop'], details: {} },
            { name: 'FrameGrid', subNodes: ['FrameDrop', 'VaultNode', 'QRBeam', 'SetClaim'], details: {} },
            { name: 'CivicTag', subNodes: ['TagClaim', 'VaultEcho', 'QRCouncil', 'FormNode'], details: {} },
            { name: 'UrbanYield', subNodes: ['CityPlan', 'QRBuild', 'VaultMetric', 'ScanNode'], details: {} },
            { name: 'ArchiID', subNodes: ['IDDrop', 'QRSketch', 'VaultLog', 'PlanTrace'], details: {} },
            { name: 'PermitPath', subNodes: ['PermitFlow', 'QRForm', 'VaultLine', 'ZoneCert'], details: {} },
            { name: 'StructCast', subNodes: ['CastGrid', 'QRForm', 'VaultSteel', 'EchoNode'], details: {} },
            { name: 'TileFlow', subNodes: ['FlowPattern', 'QRDrop', 'VaultTile', 'MeshClaim'], details: {} },
            { name: 'ClaimNode', subNodes: ['QRClaim', 'VaultZone', 'LockPath', 'MapTrack'], details: {} },
            { name: 'BuildEcho', subNodes: ['EchoNode', 'QRPermit', 'VaultWave', 'SyncLine'], details: {} },
            { name: 'CivicMesh', subNodes: ['MeshTrace', 'QRDrop', 'VaultMap', 'TagNode'], details: {} },
            { name: 'ZoningNode', subNodes: ['QRZone', 'VaultTrace', 'RegionMap', 'ScanEcho'], details: {} },
            { name: 'ScrollRoof', subNodes: ['RoofTag', 'VaultPanel', 'QRClaim', 'TileLine'], details: {} },
            { name: 'LandCast', subNodes: ['CastNode', 'QRDrop', 'VaultAnchor', 'ClaimPing'], details: {} },
            { name: 'GeoPermit', subNodes: ['GeoScan', 'QRField', 'VaultPermit', 'TagNode'], details: {} },
            { name: 'YieldBuild', subNodes: ['QRTrack', 'VaultFlow', 'BuildCredit', 'PayoutLink'], details: {} },
            { name: 'UrbanPanel', subNodes: ['PanelForm', 'QRDrop', 'VaultPing', 'GridNode'], details: {} },
            { name: 'PlanTrace', subNodes: ['TraceClaim', 'VaultNode', 'QRCycle', 'ScrollMap'], details: {} },
            { name: 'CivicProof', subNodes: ['CertGrid', 'VaultZoning', 'QRBoard', 'CouncilLink'], details: {} }
        ],
        "justice": [
            { name: 'LawLedger', subNodes: ['CaseTrack'], details: {} },
            { name: 'EthiTrust', subNodes: ['MoralGraph'], details: {} }
        ],
        "knowledge": [
            { name: 'DataVerse', subNodes: ['ArchiveNode', 'InfoFlow'], details: {} },
            { name: 'LoreKeeper', subNodes: ['WikiLink'], details: {} }
        ],
        "micromesh": [
            { name: 'MicroSync', subNodes: ['SmallNode'], details: {} },
            { name: 'EdgeLink', subNodes: ['LocalHub'], details: {} }
        ],
        "media": [
            {   
                name: 'FrameCast',   
                subNodes: ['VideoNode', 'AudioSync', 'StreamPulse'],
                details: {
                    intro: "FrameCast™ is a protocol for secure, verifiable media streaming. It leverages FAA.ZONE's ScrollGrid for robust content delivery and integrated VaultVision for digital rights management.",
                    keyFeatures: [
                        "Secure, encrypted video streaming.",
                        "Real-time audio/video synchronization.",
                        "Dynamic content adaptation (ScrollGrid).",
                        "DRM integration with VaultVision.",
                        "Auditable stream logs via PulseMedia."
                    ],
                    metadata: {
                        productId: "MED-FCA-9001",
                        vaultId: "VAULT-M001A",
                        signalEchoLayer: "Layer Alpha v1.0",
                        deploymentZone: "Zone Media-X",
                        securityRating: "FAA-SEC A",
                        activeNodes: "5,000",
                        lastSync: "2025-06-13 19:05 SAST",
                        complianceStatus: "Active & Certified"
                    },
                    realTimeMetrics: {
                        currentPulseActivity: "55,000 pulses/sec",
                        dataVolumeProcessed: "40.5 TB",
                        latencyAverage: "70 ms"
                    },
                    vaultTraceEntries: [
                        "#1001 - Stream Session Alpha - Confirmed",
                        "#2003 - Content Sync - Completed",
                        "#3005 - DRM Check - Passed",
                        "#4007 - Node Health - OK"
                    ]
                }
            },
            { name: 'SonicGrid', subNodes: ['AudioNode', 'QRMix'], details: {} },
            { name: 'EditMesh', subNodes: ['CutChain', 'TimelineScroll'], details: {} },
            { name: 'PulseMedia', subNodes: ['StreamSignal', 'EchoTag'], details: {} },
            { name: 'VaultVision', subNodes: ['VaultClip', 'QRLabel'], details: {} },
            { name: 'ScrollSound', subNodes: ['SoundNode', 'QRTrack'], details: {} },
            { name: 'RenderCast', subNodes: ['RenderGrid', 'VaultOutput'], details: {} },
            { name: 'VoiceLoop', subNodes: ['VoicePing', 'TrackID'], details: {} },
            { name: 'AudioDrop', subNodes: ['DropWave', 'VaultClaim'], details: {} },
            { name: 'MediaMesh', subNodes: ['ClipMesh', 'VaultFrame'], details: {} }
        ],
        "nutrition": [
            { name: 'NutriLife', subNodes: ['DietNode'], details: {} },
            { name: 'FoodSense', subNodes: ['IngestTrack'], details: {} }
        ],
        "ai-logic": [
            { name: 'OmniKey', subNodes: ['BrainNode', 'LogicLink'], details: {} },
            { name: 'CogniGrid', subNodes: ['SynapseNet'], details: {} }
        ],
        "packaging": [
            { name: 'PackChain', subNodes: ['BoxTrack'], details: {} },
            { name: 'EcoPack', subNodes: ['GreenWrap'], details: {} }
        ],
        "quantum": [
            { name: 'QuantumMesh', subNodes: ['QubitNode'], details: {} },
            { name: 'EntangleSec', subNodes: ['CryptoLink'], details: {} }
        ],
        "ritual": [
            { name: 'RiteNode', subNodes: ['TraditionSync'], details: {} },
            { name: 'CultureWeave', subNodes: ['CeremonyLink'], details: {} }
        ],
        "saas": [
            { name: 'SaaSFlow', subNodes: ['CloudNode'], details: {} },
            { name: 'AppServe', subNodes: ['LicenceKey'], details: {} }
        ],
        "trade": [
            { name: 'TradeLink', subNodes: ['ExchangeNode'], details: {} },
            { name: 'MarketFlow', subNodes: ['DemandTrack'], details: {} }
        ],
        "utilities": [
            { name: 'PowerGrid', subNodes: ['EnergyNode'], details: {} },
            { name: 'WaterSense', subNodes: ['HydroLink'], details: {} }
        ],
        "voice": [
            { name: 'VoiceSynth', subNodes: ['VocalNode'], details: {} },
            { name: 'EchoSphere', subNodes: ['AudioID'], details: {} }
        ],
        "webless": [
            { name: 'OmniQR', subNodes: ['BeaconNode'], details: {} },
            { name: 'DirectLink', subNodes: ['OfflineSync'], details: {} }
        ],
        "nft": [
            { name: 'ClaimGrid', subNodes: ['AssetNode'], details: {} },
            { name: 'ArtToken', subNodes: ['RoyaltyFlow'], details: {} }
        ],
        "education-youth": [
            { name: 'EduKidz', subNodes: ['PlayLearnNode'], details: {} },
            { name: 'FutureMinds', subNodes: ['SkillTrack'], details: {} }
        ],
        "zerowaste": [
            { name: 'EcoCycle', subNodes: ['RecycleNode'], details: {} },
            { name: 'ReGen', subNodes: ['CompostTrack'], details: {} }
        ],
        "professional": [
            { name: 'ProAssist', subNodes: ['ConsultNode'], details: {} },
            { name: 'LegalVault', subNodes: ['DocuChain'], details: {} }
        ],
        "payroll-mining": [
            { name: 'PayFlow', subNodes: ['CryptoPayroll'], details: {} },
            { name: 'MineLedger', subNodes: ['TokenMine'], details: {} }
        ],
        "mining": [
            { name: 'DigiMine', subNodes: ['BlockDig'], details: {} },
            { name: 'OreLink', subNodes: ['ResourceTrack'], details: {} }
        ],
        "wildlife": [
            { name: 'EcoGuard', subNodes: ['BioCensus'], details: {} },
            { name: 'NatureWatch', subNodes: ['HabitatMonitor'], details: {} }
        ]
    };

    // Consolidated static data initialization
    // This data will not be fetched from the backend for this standalone version.
    const MOCK_BRANDS_DATA_FOR_STANDALONE = {};
    function initializeMockBrandsDataForStandalone() {
        for (const sectorKey in ALL_BRANDS_DETAILS_BY_SECTOR) {
            const brandsInSector = ALL_BRANDS_DETAILS_BY_SECTOR[sectorKey];
            const formattedBrands = brandsInSector.map(brand => ({ 
                name: brand.name, 
                subNodes: brand.subNodes || [] 
            }));
            
            MOCK_BRANDS_DATA_FOR_STANDALONE[sectorKey] = {
                brands: formattedBrands.map(b => b.name), // Store only names for the /api/sectors brands array
                nodes: formattedBrands.map(b => b.subNodes) // Store subnodes as an array of arrays
            };
        }
    }
    initializeMockBrandsDataForStandalone(); // Call to initialize the local mock data

    // Data for pricing (derived from FAA_ZONE_INDEX_SUMMARY_DATA for consistent pricing)
    const STANDALONE_PRICING_DATA = {
        "Agriculture & Biotech Starter Package": { monthly: 550.00, annual: 5500.00 },
        "General Pro Package": { monthly: 1200.00, annual: 12000.00 } // Example fixed pricing for mock
    };


    // Function to display temporary messages on the page
    function showDynamicMessage(message, type = 'alert') {
        let msgBox = document.getElementById('temp-message-box');
        if (!msgBox) {
            msgBox = document.createElement('div');
            msgBox.id = 'temp-message-box';
            msgBox.className = 'message-box';
            document.body.appendChild(msgBox);
        }
        msgBox.textContent = message;
        msgBox.className = `message-box show ${type}`;

        setTimeout(() => {
            msgBox.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    }

    function handlePaymentClick(productName) {
        console.log(`User clicked to pay for: ${productName}`);
        showDynamicMessage(`Simulating PayPal Checkout for ${productName}. This is for visual testing only. No actual payment will occur.`, 'info');
    }

    // --- NEW: Backend-only data initialization and API routes ---
    const MOCK_BRANDS_DATABASE = {};
    const ALL_BRANDS_DETAILS_BY_SECTOR_SERVER = { /* ... (same data as frontend ALL_BRANDS_DETAILS_BY_SECTOR) ... */ }; // Placeholder for actual data

    function initializeServerBrandsDatabase() {
        // This function will initialize the MOCK_BRANDS_DATABASE on the server
        for (const sectorKey in ALL_BRANDS_DETAILS_BY_SECTOR) { // Using the common data for initialization
            const brandsInSector = ALL_BRANDS_DETAILS_BY_SECTOR[sectorKey];
            MOCK_BRANDS_DATABASE[sectorKey] = {
                brands: brandsInSector.map(b => b.name),
                nodes: brandsInSector.map(b => b.subNodes) // Assuming subNodes is an array
            };
        }
        console.log("Mock Brands Database Initialized (Server-side).");
    }

    initializeServerBrandsDatabase(); // Call server-side initialization

    // Endpoint to fetch all brand data by sector
    app.get('/api/sectors', (req, res) => {
        res.json(MOCK_BRANDS_DATABASE);
    });

    // Endpoint to add a new brand to a sector
    app.post('/api/sectors', (req, res) => {
        const { sector, brand, subnodes } = req.body;
        if (sector && brand && subnodes && Array.isArray(subnodes)) {
            if (!MOCK_BRANDS_DATABASE[sector]) {
                MOCK_BRANDS_DATABASE[sector] = { brands: [], nodes: [] };
            }
            const brandExists = MOCK_BRANDS_DATABASE[sector].brands.includes(brand);
            if (!brandExists) {
                MOCK_BRANDS_DATABASE[sector].brands.push(brand);
                MOCK_BRANDS_DATABASE[sector].nodes.push(subnodes); 
                console.log(`Added brand "${brand}" to sector "${sector}" in mock database.`);
                res.json({ success: true, message: `Brand "${brand}" added to "${sector}".` });
            } else {
                console.log(`Brand "${brand}" already exists in sector "${sector}". Skipping add.`);
                res.status(200).json({ success: false, message: `Brand "${brand}" already exists in "${sector}".` });
            }
        } else {
            res.status(400).json({ success: false, message: 'Invalid request body.' });
        }
    });

    // Endpoint to serve the admin_panel.html (default route for the server)
    // Removed specific route handler for '/' or '/admin_panel.html'
    // app.use(express.static(path.join(__dirname, '../public'))); // This is already at the top

    // Catch-all for any other requests not matched by static files or specific routes
    app.get('*', (req, res) => {
        res.status(404).send('Not Found'); // Or redirect to a custom 404 page
    });


    // Start the server
    app.listen(port, () => {
        console.log(`Mock FAA.ZONE local backend listening at http://localhost:${port}`);
        console.log(`Access Admin Panel at http://localhost:${port}/admin_panel.html`);
        console.log(`Access Brands Data at http://localhost:${port}/api/sectors`);
    });
