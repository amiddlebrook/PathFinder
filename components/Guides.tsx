import React, { useState, useMemo } from 'react';
import { GuideArticle } from '../types';
import { BookOpenIcon } from './icons';

const guideArticles: GuideArticle[] = [
    {
        id: '1',
        category: 'Safety',
        title: 'Wilderness First-Aid Kit',
        summary: 'Essential items for your personal first-aid kit.',
        content: `
            <h4 class="text-xl font-bold mb-2">Build a Personal Kit</h4>
            <p class="mb-4">Your first-aid kit should be tailored to your trip's length and potential risks. Start with a pre-made kit and customize it.</p>
            <h5 class="text-lg font-semibold mb-1">Wound Care:</h5>
            <ul class="list-disc list-inside space-y-1">
                <li>Adhesive bandages of various sizes</li>
                <li>Gauze pads (sterile, various sizes)</li>
                <li>Medical tape and self-adherent wrap (Coban)</li>
                <li>Antiseptic wipes (BZK or alcohol)</li>
                <li>Antibiotic ointment (bacitracin)</li>
                <li>Blister treatment (Moleskin, Glacier Gel)</li>
                <li>Tweezers for splinters/ticks</li>
                <li>Trauma shears or small scissors</li>
            </ul>
            <h5 class="text-lg font-semibold mt-4 mb-1">Medications:</h5>
            <ul class="list-disc list-inside space-y-1">
                <li>Pain relievers (Ibuprofen, Acetaminophen)</li>
                <li>Antihistamines (for allergic reactions)</li>
                <li>Antidiarrheal medication</li>
                <li>Personal medications</li>
            </ul>
        `,
    },
    {
        id: '2',
        category: 'Environment',
        title: 'Leave No Trace Principles',
        summary: 'The 7 core principles for ethical outdoor travel.',
        content: `
            <h4 class="text-xl font-bold mb-2">The 7 Principles</h4>
            <p>These principles help us minimize our impact and preserve the wilderness for future generations.</p>
            <ul class="list-decimal list-inside space-y-3">
                <li><strong>Plan Ahead and Prepare:</strong> Know the regulations and special concerns for the area you'll visit. Travel in small groups. Repackage food to minimize waste.</li>
                <li><strong>Travel and Camp on Durable Surfaces:</strong> Use existing trails and campsites. In pristine areas, disperse use to prevent the creation of new campsites and trails. Avoid trampling fragile vegetation.</li>
                <li><strong>Dispose of Waste Properly:</strong> Pack it in, pack it out. This includes all trash, food scraps, and toilet paper. For human waste, dig catholes 6-8 inches deep and at least 200 feet from water, camp, and trails.</li>
                <li><strong>Leave What You Find:</strong> Preserve the past: examine, but do not touch, cultural or historic structures and artifacts. Leave rocks, plants, and other natural objects as you find them.</li>
                <li><strong>Minimize Campfire Impacts:</strong> Use a lightweight stove for cooking. Where fires are permitted, use established fire rings, keep fires small, and burn all wood to ash. Ensure fires are completely extinguished.</li>
                <li><strong>Respect Wildlife:</strong> Observe wildlife from a distance. Never feed animals. Store food and trash securely to protect wildlife and your food.</li>
                <li><strong>Be Considerate of Other Visitors:</strong> Respect other visitors and protect the quality of their experience. Let nature's sounds prevail. Avoid loud voices and noises.</li>
            </ul>
        `,
    },
    {
        id: '3',
        category: 'Skills',
        title: 'Advanced Map & Compass',
        summary: 'The fundamentals of staying found with classic tools.',
        content: `
            <h4 class="text-xl font-bold mb-2">Map & Compass Essentials</h4>
            <p class="mb-4">Never rely solely on GPS. A physical map and compass are your most reliable tools. They don't run out of batteries.</p>
            <h5 class="text-lg font-semibold mb-1">Understanding Declination:</h5>
            <p class="mb-4">Magnetic North (where your compass points) and True North (where map lines point) are different. This difference is declination. Topo maps list the local declination. You must adjust your compass to account for this for accurate navigation, either by setting it on the compass itself or by adding/subtracting the value from your bearings.</p>
            <h5 class="text-lg font-semibold mb-1">Orienting the Map:</h5>
            <p class="mb-4">Set your compass declination. Place your compass on the map. Rotate the map and compass together until the North arrow on the map aligns with the direction the magnetic compass needle is pointing. Now your map is aligned with the terrain around you.</p>
            <h5 class="text-lg font-semibold mb-1">Taking a Bearing:</h5>
            <p class="mb-4">Point the compass's direction-of-travel arrow at a landmark you want to hike to. Rotate the bezel (the dial) until the red magnetic needle is "in the shed" (perfectly inside the red outline arrow on the bezel). The number at the index line is your bearing. Hike while keeping the needle in the shed.</p>
        `,
    },
    {
        id: '4',
        category: 'Safety',
        title: 'Hypothermia & Hyperthermia',
        summary: 'How to recognize and respond to temperature extremes.',
        content: `
            <h4 class="text-xl font-bold mb-2">Recognizing and Treating Temperature Illness</h4>
            <p class="mb-4">Both cold and heat can be deadly in the backcountry.</p>
            <h5 class="text-lg font-semibold mb-1">Hypothermia (Too Cold):</h5>
            <p class="mb-2">Signs are the "Umbles": Stumbles, Mumbles, Fumbles, Grumbles. Shivering is an early sign; lack of shivering is a very late, dangerous sign.</p>
            <ul class="list-disc list-inside space-y-1">
                <li><strong>Treatment:</strong> Get out of the elements, remove wet clothing, give warm (not hot) sweet drinks, and use external heat sources on the core (neck, armpits, groin). Evacuate immediately.</li>
            </ul>
            <h5 class="text-lg font-semibold mt-4 mb-1">Hyperthermia (Too Hot):</h5>
             <p class="mb-2">Starts as heat exhaustion (nausea, headache, dizziness) and can progress to deadly heat stroke (confusion, lack of sweating, seizures).</p>
            <ul class="list-disc list-inside space-y-1">
                <li><strong>Treatment:</strong> Stop all activity. Find shade. Sip cool water with electrolytes. Loosen clothing. For heat stroke, aggressive cooling is critical: immerse in cool water if possible. Evacuate immediately.</li>
            </ul>
        `
    },
    {
        id: '5',
        category: 'Skills',
        title: 'Backcountry Nutrition',
        summary: 'Fueling your body for peak performance on the trail.',
        content: `
            <h4 class="text-xl font-bold mb-2">Food is Fuel</h4>
            <p class="mb-4">For multi-day trips, aim for 1.5 to 2.5 pounds of food per person per day, with a target of 100-125 calories per ounce.</p>
            <h5 class="text-lg font-semibold mb-1">Macronutrient Balance:</h5>
            <ul class="list-disc list-inside space-y-1">
                <li><strong>Carbohydrates (4 cal/g):</strong> Your primary energy source. Pack complex carbs like oats and whole grains for sustained energy, and simple carbs like candy or dried fruit for quick boosts.</li>
                <li><strong>Fats (9 cal/g):</strong> The most calorie-dense food. Nuts, seeds, olive oil, and cheese are excellent sources for long-lasting energy.</li>
                <li><strong>Proteins (4 cal/g):</strong> Essential for muscle repair. Jerky, protein powder, and quinoa are great options.</li>
            </ul>
            <h5 class="text-lg font-semibold mt-4 mb-1">Meal Planning Tips:</h5>
             <p>Repackage all food from bulky commercial packaging into zip-top bags to save space and weight. Plan each day's meals and snacks and pack them together. Always bring at least one extra day of emergency food.</p>
        `
    },
    {
        id: '6',
        category: 'Gear',
        title: 'The Ten Essentials',
        summary: 'The classic safety system for any outdoor trip.',
        content: `
            <h4 class="text-xl font-bold mb-2">The Updated 10 Essentials System</h4>
            <p class="mb-4">These aren't 10 specific items, but 10 systems to ensure you're prepared for an emergency overnight stay in the backcountry.</p>
            <ol class="list-decimal list-inside space-y-2">
                <li><strong>Navigation:</strong> Map, Compass, and a GPS device/phone with backup power.</li>
                <li><strong>Headlamp:</strong> Plus extra batteries.</li>
                <li><strong>Sun Protection:</strong> Sunglasses, sunscreen, and a hat.</li>
                <li><strong>First Aid:</strong> A well-stocked, personal first-aid kit.</li>
                <li><strong>Knife:</strong> Plus a gear repair kit (tape, cordage, etc.).</li>
                <li><strong>Fire:</strong> Lighter, waterproof matches, and fire starter (e.g., dryer lint).</li>
                <li><strong>Shelter:</strong> Emergency blanket or bivy.</li>
                <li><strong>Extra Food:</strong> Beyond the minimum expectation for the trip (e.g., one extra day's worth).</li>
                <li><strong>Extra Water:</strong> Beyond the minimum, and a way to purify more.</li>
                <li><strong>Extra Clothes:</strong> An extra insulating layer beyond what you expect to wear.</li>
            </ol>
        `
    },
     {
        id: '7',
        category: 'Safety',
        title: 'Wildlife Safety: Bears & More',
        summary: 'How to properly store food and act during an encounter.',
        content: `
            <h4 class="text-xl font-bold mb-2">Bear Safety is Food Safety</h4>
            <p class="mb-4">Almost all bear encounters are preventable by practicing proper food storage. A fed bear is a dead bear.</p>
            <h5 class="text-lg font-semibold mb-1">Food Storage:</h5>
            <ul class="list-disc list-inside space-y-1">
                <li><strong>Use a bear canister.</strong> This is the most effective and often required method in many parks.</li>
                <li><strong>Store ALL scented items.</strong> This includes toothpaste, deodorant, sunscreen, trash, and the clothes you cooked in.</li>
                <li><strong>Cook and eat 100 yards downwind from your tent.</strong></li>
            </ul>
             <h5 class="text-lg font-semibold mt-4 mb-1">Other Wildlife:</h5>
            <p>Do not feed any wildlife, including small animals like squirrels and marmots. They can carry diseases and become aggressive. Keep a clean camp to avoid attracting rodents and other pests.</p>
        `
    },
    {
        id: '8',
        category: 'Gear',
        title: 'Ultralight Principles',
        summary: 'Reduce pack weight to travel farther, faster, and more comfortably.',
        content: `
            <h4 class="text-xl font-bold mb-2">Less Weight, More Fun</h4>
            <p class="mb-4">Ultralight backpacking is a philosophy of intentional minimalism. A lighter pack reduces strain on your body and allows for a more enjoyable experience.</p>
            <ol class="list-decimal list-inside space-y-3">
                <li><strong>Weigh Everything:</strong> The first step is to know what you're carrying. Use a kitchen scale and a spreadsheet to track the weight of every single item.</li>
                <li><strong>The "Big Three":</strong> Your backpack, shelter, and sleep system are the heaviest items. Focusing on lightweight options here provides the biggest weight savings.</li>
                <li><strong>Multi-purpose Gear:</strong> Find items that serve more than one function. A trekking pole can be used as a tent pole. A cooking pot can be your bowl and mug.</li>
                <li><strong>Ditch "Just-in-Case" Items:</strong> Pack for the conditions you expect, not every possible scenario. Bring skills, not fears. (This does not apply to essential safety gear like a first-aid kit).</li>
                <li><strong>Reduce Consumable Weight:</strong> Repackage food. Carry only as much water as you need between reliable sources. Use a small travel-size tube of toothpaste.</li>
            </ol>
        `
    },
    {
        id: '9',
        category: 'Gear',
        title: 'Gear Maintenance & Repair',
        summary: 'Care for your gear so it can care for you.',
        content: `
            <h4 class="text-xl font-bold mb-2">Extend the Life of Your Gear</h4>
            <p class="mb-4">Proper maintenance and field repairs can save your trip and your wallet.</p>
            <h5 class="text-lg font-semibold mb-1">Post-Trip Care:</h5>
            <ul class="list-disc list-inside space-y-1">
                <li><strong>Tents:</strong> Always air-dry your tent completely before storing to prevent mildew. Clean with a non-detergent soap.</li>
                <li><strong>Sleeping Bags:</strong> Store loosely in a large breathable sack, not the compression stuff sack. Wash only when necessary with a special down or synthetic-safe wash.</li>
                <li><strong>Waterproof Jackets:</strong> Clean jackets perform better. Wash with a tech-wash and re-apply DWR (Durable Water Repellent) finish when water no longer beads up.</li>
            </ul>
            <h5 class="text-lg font-semibold mt-4 mb-1">Field Repair Kit:</h5>
            <p>Your repair kit should be small but mighty. Include:</p>
            <ul class="list-disc list-inside space-y-1">
                <li><strong>Duct Tape:</strong> Wrap a few feet around your trekking pole or water bottle.</li>
                <li><strong>Tenacious Tape:</strong> Excellent for repairing rips in tents, jackets, and sleeping pads.</li>
                <li><strong>Sleeping Pad Patch Kit:</strong> The one that came with your pad.</li>
                <li><strong>Zip ties and a small multi-tool.</strong></li>
            </ul>
        `
    },
];

const Guides: React.FC = () => {
    const [selectedArticleId, setSelectedArticleId] = useState<string>(guideArticles[0].id);

    const selectedArticle = guideArticles.find(a => a.id === selectedArticleId);
    
    const groupedArticles = useMemo(() => {
        const categories: GuideArticle['category'][] = ['Safety', 'Skills', 'Gear', 'Environment'];
        const grouped = categories.reduce((acc, cat) => {
            acc[cat] = [];
            return acc;
        }, {} as Record<string, GuideArticle[]>);

        guideArticles.forEach(item => {
            if (grouped[item.category]) {
                grouped[item.category].push(item);
            }
        });
        return grouped;
    }, []);

    const sortedCategories = Object.keys(groupedArticles).filter(cat => groupedArticles[cat].length > 0);

    return (
        <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
            <header className="p-6 border-b border-[var(--color-border)] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <BookOpenIcon className="w-8 h-8 text-[var(--color-accent)]" />
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Guides</h2>
                        <p className="text-[var(--color-text-secondary)]">Essential offline knowledge for the trail.</p>
                    </div>
                </div>
            </header>
            <div className="flex-grow flex h-full overflow-hidden">
                <aside className="w-1/3 border-r border-[var(--color-border)] p-4 overflow-y-auto">
                    <nav className="space-y-4">
                        {sortedCategories.map(category => (
                            <div key={category}>
                                <h3 className="text-sm font-bold uppercase text-[var(--color-text-tertiary)] px-3 pb-2">{category}</h3>
                                <div className="space-y-1">
                                    {groupedArticles[category].map(article => (
                                         <button
                                            key={article.id}
                                            onClick={() => setSelectedArticleId(article.id)}
                                            className={`w-full text-left p-3 rounded-lg font-semibold transition-colors ${selectedArticleId === article.id ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent-text)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-interactive)]/50 hover:text-[var(--color-text-primary)]'}`}
                                        >
                                            {article.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </aside>
                <main className="w-2/3 p-8 overflow-y-auto">
                    {selectedArticle && (
                        <article className="prose max-w-none">
                            <h3 className="text-3xl font-extrabold tracking-tight border-b border-[var(--color-border)] pb-4 mb-6">{selectedArticle.title}</h3>
                            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
                        </article>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Guides;